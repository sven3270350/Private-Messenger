import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  PermissionsAndroid,
  Image,
} from "react-native";
import { 
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from "react-native-responsive-screen";
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
} from "react-native-agora";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import Octicons from '@expo/vector-icons/Octicons';
import { Feather, Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from "@/constants/Colors";

const getPermission = async () => {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }
};

export default function OngoingVideoCall() {
  const agoraEngineRef = useRef<IRtcEngine>(); // IRtcEngine instance
  const router = useRouter();

  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [remoteUid, setRemoteUid] = useState(0); // Remote user UID
  const [duration, setDuration] = useState(0);

  const {token, channelName, userAvatar} = useLocalSearchParams();

  useEffect(() => {
    agoraEngineRef.current?.muteLocalVideoStream(!videoEnabled);
  }, [videoEnabled, agoraEngineRef]);

  useEffect(() => {
    agoraEngineRef.current?.muteLocalAudioStream(!audioEnabled);
  }, [audioEnabled, agoraEngineRef]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (remoteUid > 0) {
      interval = setInterval(() => {
        setDuration((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [remoteUid]);

  useEffect(() => {
    return () => {
      agoraEngineRef.current?.disableAudio();
      agoraEngineRef.current?.disableVideo();
    };
  }, []);

  // Initialize the engine when starting the App
  useEffect(() => {
    (async () => {
      if (process.env.EXPO_PUBLIC_AGORA_APPID && token && channelName) {
        await setupVideoSDKEngine();
        await join();
      }
    })();

    return () => {
      leave();
    };
  }, [channelName, token]);

  const setupVideoSDKEngine = async () => {
    try {
      // Create RtcEngine after checking and obtaining device permissions
      if (Platform.OS === "android") {
        await getPermission();
      }

      agoraEngineRef.current = createAgoraRtcEngine();

      const agoraEngine = agoraEngineRef.current;

      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (_connection: any) => {
          setTimeout(() => {
            setRemoteUid((remoteUid) => {
              if (remoteUid > 0) return remoteUid;
              else {
                leave();
                return 0;
              }
            });
          }, 35 * 1000);
        },
        onUserJoined: (_connection: any, Uid: React.SetStateAction<number>) => {
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection: any, Uid: any) => {
          setRemoteUid(0);
          leave();
        },
        onUserMuteVideo: (_connection: any, remoteUid: any, muted: any) => {
        },
      });

      agoraEngine.initialize({
        appId: process.env.EXPO_PUBLIC_AGORA_APPID,
      });

      agoraEngine.startPreview();

      agoraEngine.enableVideo();
      agoraEngine.enableAudio();
    } catch (e) {
      console.log(e);
    }
  };

  const join = async () => {
    if (remoteUid > 0) return;

    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication
      );

      agoraEngineRef.current?.joinChannel(token as string, channelName as string, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const leave = useCallback(() => {
    try {
      agoraEngineRef.current?.leaveChannel();
    } catch (e) {
      console.log(e);
    } finally {
      setRemoteUid(0);
      toast.success(`Call ended`)
      router.replace("(tabs)/calls");
    }
  }, [agoraEngineRef.current]);

  const handleMuteVideo = () => {
    setVideoEnabled(!videoEnabled);
  };

  const handleMuteAudio = () => {
    setAudioEnabled(!audioEnabled);
    agoraEngineRef.current?.muteLocalAudioStream(!audioEnabled);
  };

  const handleSwitchCamera = () => {
    agoraEngineRef.current?.switchCamera();
  };

  const handleEndCall = () => {
    leave();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={wp(8)} color="white" onPress={handleEndCall}/>
      </View>
      <View style={styles.videoContainer}>
        <View style={styles.videoPlace}>
          {remoteUid > 0 ? (
            <RtcSurfaceView
              canvas={{ uid: remoteUid }}
              style={styles.remoteVideo}
              zOrderOnTop={false}
            />
            )
            :
            (
              <Image
                style={styles.remoteVideo}
                src={userAvatar as string}
              />
            )
          }
          {!!agoraEngineRef.current && (
            <RtcSurfaceView
              canvas={{ uid: 0 }}
              style={styles.localVideo}
              zOrderOnTop={true}
            />
          )}
        </View>
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, videoEnabled && styles.buttonSelected]} onPress={handleMuteVideo}>
              <Octicons name="device-camera-video" size={wp(10)} color={videoEnabled ? "black" : "white"} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, audioEnabled && styles.buttonSelected]} onPress={handleMuteAudio}>
              <Feather name={audioEnabled ? "mic-off" : "mic"} size={wp(10)} color={audioEnabled ? "black" : "white"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSwitchCamera}>
              {/* <AntDesign name="sound" size={wp(10)} color="white" /> */}
              <Ionicons name="camera-reverse-outline" size={wp(10)} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.endCallBtn]}
              onPress={handleEndCall}
            >
              <MaterialCommunityIcons name="phone-hangup-outline" size={wp(10)} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop:
    //   Platform.OS === "ios" ? hp(1) : hp(1) + StatusBar?.currentHeight!,
    flex: 1,
  },
  header: {
    position: "absolute",
    marginTop: StatusBar.currentHeight,
    padding: wp(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 10,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlace: {
    width: "100%",
    height: "100%",
  },
  footer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: wp(4),
    bottom: wp(10),
    justifyContent: "center",
    zIndex: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: wp(4),
  },
  button: {
    width: wp(20),
    height: wp(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: wp(6),
  },
  buttonSelected: {
    backgroundColor: Colors.white,
  },
  endCallBtn: {
    backgroundColor: "red",
  },
  localVideo: {
    width: wp(30),
    height: wp(48),
    backgroundColor: Colors.background,
    margin: wp(4),
    position: "absolute",
    bottom: wp(30),
    right: 0,
    zIndex: 5,
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.red,
    zIndex: 1,
  },
});


