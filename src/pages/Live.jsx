import "./Live.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  Constants,
} from "@videosdk.live/react-sdk";
import Hls from "hls.js";

import { authToken, createMeeting } from "./API";
import ReactPlayer from "react-player";

function JoinScreen({ getMeetingAndToken, setMode }) {
  const [meetingId, setMeetingId] = useState(null);

  const onClick = async (mode) => {
    setMode(mode);
    await getMeetingAndToken(meetingId);
  };

  return (
    <div className="container">
      <button className="btn_live" onClick={() => onClick("CONFERENCE")}>Create Classroom</button>
      <br />
      <h4> OR</h4>
      <br />
      <br />
      <input
        type="text"
        placeholder="Enter Room Id"
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <br />
      <br />
      <div>
      <button className="btn_live" onClick={() => onClick("CONFERENCE")}>Join as Instructor</button>
      {"   |    "}
      <button className="btn_live" onClick={() => onClick("VIEWER")}>Join as Student</button>
      </div>
      <br />
    </div>
  );
}

function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div>
      <p>
        Participant: {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
        {micOn ? "ON" : "OFF"}
      </p>
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn && (
        <ReactPlayer
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={videoStream}
          height={"300px"}
          width={"300px"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      )}
    </div>
  );
}

function Controls() {
  const { leave, toggleMic, toggleWebcam, startHls, stopHls, toggleScreenShare, screenShareEnabled } = useMeeting();
  return (
    <div>
      <button className="control-btn" onClick={() => leave()}>Leave</button>
      &emsp;|&emsp;
      <button className="control-btn" onClick={() => toggleMic()}>Mic</button>
      <button className="control-btn" onClick={() => toggleWebcam()}>Webcam</button>
      <button className="control-btn" onClick={() => toggleScreenShare()}>{screenShareEnabled ? "Stop Screen Share" : "Start Screen Share"}</button>
      &emsp;|&emsp;
      <button className="control-btn" 
              onClick={() => {
                startHls({
                  layout: {
                    type: "SPOTLIGHT",
                    priority: "PIN",
                    gridSize: "20",
                  },
                  theme: "LIGHT",
                  mode: "video-and-audio",
                  quality: "high",
                  orientation: "landscape",
                });
              }}>Start Class</button>
      <button className="control-btn" onClick={() => stopHls()}>Stop Class</button>
    </div>
  );
}

function SpeakerView() {
  const { participants, hlsState } = useMeeting();
  const [viewerCount, setViewerCount] = useState(0); // State to keep track of viewer count

  useEffect(() => {
    // Calculate the number of viewers
    const viewerParticipants = [...participants.values()].filter(
      (participant) => participant.mode === Constants.modes.VIEWER
    );
    setViewerCount(viewerParticipants.length);
  }, [participants]);

  const speakers = useMemo(() => {
    return [...participants.values()].filter(
      (participant) => participant.mode === Constants.modes.CONFERENCE
    );
  }, [participants]);

  return (
    <div>
      <p>Current HLS State: {hlsState}</p>
      <p>Number of Viewers: {viewerCount}</p> {/* Display the number of viewers */}
      <Controls />
      {speakers.map((participant) => (
        <ParticipantView participantId={participant.id} key={participant.id} />
      ))}
    </div>
  );
}



function ViewerView() {
  const playerRef = useRef(null);
  const { hlsUrls, hlsState } = useMeeting();
  const { leave } = useMeeting(); // Add leave function from useMeeting

  useEffect(() => {
    if (hlsUrls.downstreamUrl && hlsState === "HLS_PLAYABLE") {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrls.downstreamUrl);
        hls.attachMedia(playerRef.current);
      } else {
        if (typeof playerRef.current?.play === "function") {
          playerRef.current.src = hlsUrls.downstreamUrl;
          playerRef.current.play();
        }
      }
    }
  }, [hlsUrls, hlsState, playerRef.current]);

  return (
    <div>
      {hlsState !== "HLS_PLAYABLE" ? (
        <div>
          <p>HLS has not started yet or is stopped</p>
        </div>
      ) : (
        hlsState === "HLS_PLAYABLE" && (
          <div>
            <video
              ref={playerRef}
              autoPlay
              controls
              style={{ width: "100%", height: "100%" }}
              playsInline
              muted
              playing
              onError={(err) => {
                console.log(err, "hls video error");
              }}
            ></video>
          </div>
        )
      )}
    </div>
  );
}



function Container(props) {
  const [joined, setJoined] = useState(null);
  const { join, leave } = useMeeting(); // Include leave function from useMeeting

  const mMeeting = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div className="container">
      <h3>Meeting Id: {props.meetingId}</h3>
      {joined && joined === "JOINED" ? (
        mMeeting.localParticipant.mode === Constants.modes.CONFERENCE ? (
          <SpeakerView />
        ) : mMeeting.localParticipant.mode === Constants.modes.VIEWER ? (
          <ViewerView />
        ) : null
      ) : joined && joined === "JOINING" ? (
        <p>Joining the meeting...</p>
      ) : (
        <>
          <button className="btn_live" onClick={joinMeeting}>Join</button>
        </>
      )}
      {/* Render leave button for viewers */}
      {joined && joined === "JOINED" && mMeeting.localParticipant.mode === Constants.modes.VIEWER && (
        <button className="btn_live" onClick={() => leave()}>Leave</button>
      )}
    </div>
  );
}


function Live() {
  const [meetingId, setMeetingId] = useState(null);

  const [mode, setMode] = useState("CONFERENCE");

  const getMeetingAndToken = async (id) => {
    const meetingId =
      id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        screenShareEnabled: true, // Enable screen sharing
        name: "Instructor",
        mode: mode,
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => (
          <Container meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
        )}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} setMode={setMode} />
  );
}

export default Live;
