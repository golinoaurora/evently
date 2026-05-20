import { Platform } from "react-native";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost/evently/backend/api"
  : "http://172.20.10.2/evently/backend/api";

export default BASE_URL;