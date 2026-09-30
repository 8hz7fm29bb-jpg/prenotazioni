import type {MetadataRoute} from "next";

export default function manifest():MetadataRoute.Manifest{
  return {
    name:"22 Booking",
    short_name:"22 Booking",
    description:"Gestione prenotazioni Officina22",
    start_url:"/",
    display:"standalone",
    background_color:"#ffffff",
    theme_color:"#2EB1E8",
    icons:[
      {src:"/icon",sizes:"512x512",type:"image/png"},
      {src:"/apple-icon",sizes:"180x180",type:"image/png"}
    ]
  };
}
