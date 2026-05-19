import { Platform } from "react-native";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost/evently/backend/api"
  : "http://192.168.1.189/evently/backend/api";

export default BASE_URL;