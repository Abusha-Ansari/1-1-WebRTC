// import React, { useEffect, useState } from "react";

// const Sender = () => {
// //   const [socket, setSocket] = useState(null);
// const socket = new WebSocket("ws://localhost:6969");

//   useEffect(() => {
    
//     // setSocket(new WebSocket("ws://localhost:6969"))
//     // setSocket(soc);
//     console.log(socket)
//     socket.onopen = () => {
//       socket.send(JSON.stringify({ type: "sender" }));
//     };
//   }, []);

//   const sendVideo = async () => {
//     console.log(socket);
//     if (!socket) {
//       return;
//     }
//     const pc = new RTCPeerConnection();

//     pc.onnegotiationneeded = async () => {
//     console.log("onnegotiation happening");
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       socket.send(
//         JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
//       );
//     };



//     pc.onicecandidate = (event) => {
//       console.log("Ice candidate", event.candidate);
//       if (event.candidate) {
//         socket.send(
//           JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
//         );
//       }
//     };

//     socket.onmessage = (e) => {
//       const data = JSON.parse(e.data);
//       if (data.type === "createAnswer") {
//         pc.setRemoteDescription(data.sdp);
//       } else if (data.candidate === "iceCandidate") {
//         pc.addIceCandidate(data.candidate);
//       }
//     };

//     const stream = await navigator.mediaDevices.getUserMedia({video: true , audio: false});
//     pc.addTrack(stream.getVideoTracks()[0]);
//   };

//   return (
//     <>
//       <div>Sender</div>
//       <button onClick={sendVideo}>Start Sending Video</button>
//     </>
//   );
// };

// export default Sender;






import React, { useEffect, useRef } from "react";

const Sender = () => {
  const socketRef = useRef(null); 
  const pcRef = useRef(null); 

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:6969");
    socketRef.current = socket;

    socket.onopen = () => {
      //console.log("WebSocket connected");
      socket.send(JSON.stringify({ type: "sender" }));
    };

    socket.onclose = () => {
      //console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendVideo = async () => {
    const socket = socketRef.current;
    if (!socket) {
      //console.error("WebSocket is not initialized");
      return;
    }
    const pc = new RTCPeerConnection();
    pcRef.current = pc;
  
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        //console.log("Sending ICE candidate:", event.candidate);
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

  
    socket.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      //console.log("Received message:", data);

      if (data.type === "createAnswer") {
        await pc.setRemoteDescription(data.sdp);
        //console.log("Remote description set on sender");
      } else if (data.type === "iceCandidate" && data.candidate) {
        await pc.addIceCandidate(data.candidate);
        //console.log("ICE candidate added on sender");
      }
    };


    pc.onnegotiationneeded = async () => {
      //console.log("Negotiation needed");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      //console.log("Local description set on sender");

      socket.send(
        JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
      );
    };

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      //console.log("Got user media stream:", stream);


      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (error) {
      //console.error("Error accessing media devices:", error);
    }
  };

  return (
    <div>
      <h1>Sender</h1>
      <button onClick={sendVideo}>Start Sending Video</button>
    </div>
  );
};

export default Sender;
