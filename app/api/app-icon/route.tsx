import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{width:"100%",height:"100%",background:"#ff0000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"Arial, Helvetica, sans-serif"}}>
        <div style={{display:"flex",fontSize:252,fontWeight:900,lineHeight:0.78,letterSpacing:-20,marginTop:-6}}>22</div>
        <div style={{width:348,height:13,background:"#fff",marginTop:30,display:"flex",borderRadius:8}}/>
        <div style={{display:"flex",fontSize:44,fontWeight:800,lineHeight:1,letterSpacing:11,marginTop:20,marginLeft:11,whiteSpace:"nowrap"}}>BOOKING</div>
      </div>
    ),
    {width:512,height:512,headers:{"Cache-Control":"public, max-age=0, must-revalidate","Content-Type":"image/png"}}
  );
}
