import { generateAccessToken } from "./helper";
export function getUserName() {
    return {"message:":"user created successfully", 
    "userName":"user101", "accessToken":generateAccessToken("user101")};
}