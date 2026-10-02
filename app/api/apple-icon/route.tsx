import { ImageResponse } from "next/og";
export const runtime="edge";
export async function GET(){
return new ImageResponse(
<div style={{width:"100%",height:"100%",background:"#ff0000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"Arial,Helvetica,sans-serif"}}>
<div style={{display:"flex",fontSize:270,fontWeight:900,lineHeight:.76,letterSpacing:-21,marginTop:-8}}>22</div>
<div style={{display:"flex",width:365,height:13,background:"#fff",borderRadius:8,marginTop:32}}/>
<div style={{display:"flex",fontSize:45,fontWeight:800,lineHeight:1,letterSpacing:11,marginTop:21,marginLeft:11}}>BOOKING</div>
</div>,
{width:512,height:512,headers:{"Content-Type":"image/png","Cache-Control":"public,max-age=0,must-revalidate"}}
)}
