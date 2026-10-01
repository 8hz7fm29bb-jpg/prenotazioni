import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width:"100%",height:"100%",background:"#22AEEF",display:"flex",
        flexDirection:"column",alignItems:"center",justifyContent:"center",
        color:"#fff",fontFamily:"Arial, Helvetica, sans-serif",borderRadius:"18%"
      }}>
        <div style={{
          display:"flex",fontSize:176,fontWeight:900,lineHeight:0.82,
          letterSpacing:-14
        }}>22</div>
        <div style={{
          width:292,height:12,background:"#fff",marginTop:28,display:"flex"
        }}/>
        <div style={{
          display:"flex",fontSize:34,fontWeight:800,lineHeight:1,
          letterSpacing:8,marginTop:18,marginLeft:8,whiteSpace:"nowrap"
        }}>BOOKING</div>
      </div>
    ),
    {
      width:180,
      height:180,
      headers:{
        "Cache-Control":"public, max-age=0, must-revalidate",
        "Content-Type":"image/png"
      }
    }
  );
}
