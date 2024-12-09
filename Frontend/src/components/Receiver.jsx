import React, { useEffect, useRef, useState } from "react";

const Receiver = () => {
  const videoRef = useRef(null);
  const [socket, setsocket] = useState(new WebSocket("ws://localhost:6969"));
  useEffect(() => {
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        //console.log("Parsed message:", message);

        if (message.type === "createOffer") {
          const pc = new RTCPeerConnection();
          pc.setRemoteDescription(message.sdp);
          pc.onicecandidate = (event) => {
            //console.log("Ice candidate", event.candidate);
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: "iceCandidate",
                  candidate: event.candidate,
                })
              );
            } else if (message.type === "iceCandidate") {
              pc.addIceCandidate(message.candidate);
            }
          };

          pc.ontrack = (event) => {
            const video = document.createElement("video");
            document.body.appendChild(video);
            video.srcObject = new MediaStream([event.track]);
            video.play();
          };

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.send(
            JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
          );
        }
      } catch (error) {
        //console.error("Error parsing WebSocket message:", error, event.data);
      }
    };
  }, []);

  return <>Receiver</>;
};

export default Receiver;





// import React, { useEffect, useRef } from "react";

// const Receiver = () => {
//   const videoRef = useRef(null);
//   const pcRef = useRef(null);
//   const iceCandidateBuffer = useRef([]);

//   useEffect(() => {
//     const socket = new WebSocket("ws://localhost:6969");

//     socket.onopen = () => {
//       socket.send(JSON.stringify({ type: "receiver" }));
//     };

//     socket.onmessage = async (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         console.log("Parsed message:", message);

//         if (message.type === "createOffer") {
//           const pc = new RTCPeerConnection();

//           pc.onicecandidate = (event) => {
//             if (event.candidate) {
//               console.log("Sending ICE candidate:", event.candidate);
//               socket.send(
//                 JSON.stringify({
//                   type: "iceCandidate",
//                   candidate: event.candidate,
//                 })
//               );
//             }
//           };

//           pc.ontrack = (event) => {
//             console.log("Track received:", event.streams[0]);
//             if (event.streams && event.streams[0] && videoRef.current) {
//               videoRef.current.srcObject = event.streams[0];
//             } else {
//               console.error("No streams found in track event.");
//             }
//           };

//           pcRef.current = pc;

//           await pc.setRemoteDescription(message.sdp);
//           console.log("Remote description set");

//           while (iceCandidateBuffer.current.length > 0) {
//             const candidate = iceCandidateBuffer.current.shift();
//             await pc.addIceCandidate(candidate);
//             console.log(
//               "Buffered ICE candidate added:",
//               JSON.stringify(candidate)
//             );
//           }

//           const answer = await pc.createAnswer();
//           await pc.setLocalDescription(answer);

//           socket.send(
//             JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
//           );
//         }

//         if (message.type === "iceCandidate" && message.candidate) {
//           const pc = pcRef.current;

//           if (pc && pc.remoteDescription) {
//             await pc.addIceCandidate(message.candidate);
//             console.log(
//               "ICE candidate added:",
//               JSON.stringify(message.candidate)
//             );
//           } else {
//             console.log(
//               "Buffering ICE candidate:",
//               JSON.stringify(message.candidate)
//             );
//             iceCandidateBuffer.current.push(message.candidate);
//           }
//         }
//       } catch (error) {
//         console.error("Error parsing WebSocket message:", error, event.data);
//       }
//     };

//     return () => {
//       socket.close();
//       if (pcRef.current) {
//         pcRef.current.close();
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <h1>Receiver</h1>
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         style={{ width: "100%" }}
//       />
//     </div>
//   );
// };

// export default Receiver;
