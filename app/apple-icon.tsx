import {ImageResponse} from "next/og";
import BookingIcon from "./BookingIcon";
export const size={width:180,height:180};
export const contentType="image/png";
export default function AppleIcon(){return new ImageResponse(<BookingIcon/>,{...size});}
