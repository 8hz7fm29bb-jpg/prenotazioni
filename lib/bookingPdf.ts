import {PDFDocument,StandardFonts,PDFFont,rgb} from "pdf-lib";
type Booking={guests:number;baby?:number;arrived?:boolean;customers:{name:string;phone:string}|null;requests:string|null;notes:string|null;taken_by?:string|null};
export async function bookingPdf(rows:Booking[],date:string,service:string){
 const pdf=await PDFDocument.create();
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const clean=(text:string)=>Array.from(text.replace(/\t/g," ")).map(c=>{try{regular.encodeText(c);return c}catch{return "?"}}).join("");
 function wrap(text:string,font:PDFFont,size:number,width:number){
  const lines:string[]=[];
  for(const paragraph of clean(text).split(/\r?\n/)){
   let line="";
   for(const word of paragraph.split(/\s+/)){
    if(line&&font.widthOfTextAtSize(line+" "+word,size)>width){lines.push(line);line=""}
    for(const char of word){if(line&&font.widthOfTextAtSize(line+char,size)>width){lines.push(line);line=""}line+=char}
    line+=" ";
   }
   lines.push(line.trimEnd());
  }
  return lines;
 }
 type Line={text:string;font:PDFFont;size:number};
 function card(r:Booking,width:number){
  const lines:Line[]=[];
  const add=(text:string,font=regular,size=9)=>wrap(text,font,size,width-42).forEach(text=>lines.push({text,font,size}));
  add(r.customers?.name||"Cliente",bold,11);
  add(`${r.guests} coperti${r.baby?` - ${r.baby} baby`:""}`,bold);
  if(r.customers?.phone)add(r.customers.phone);
  if(r.requests)add(r.requests,bold);
  if(r.notes)add(r.notes);
  add("Presa da: "+(r.taken_by||"Account non disponibile"),regular,8);
  return {r,lines,height:Math.max(40,lines.reduce((a,l)=>a+l.size+2,0)+12)};
 }
 const pageWidth=595.28,pageHeight=841.89,margin=28.35,gap=14,top=725,bottom=32;
 const singleWidth=425;
 const single=rows.map(r=>card(r,singleWidth));
 const columns=single.reduce((a,c)=>a+c.height+6,0)>top-bottom?2:1;
 const width=columns===2?(pageWidth-2*margin-gap)/2:singleWidth;
 const cards=columns===1?single:rows.map(r=>card(r,width));
 const title=new Date(date+"T12:00:00").toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 function newPage(){
  const page=pdf.addPage([pageWidth,pageHeight]);
  const center=(text:string,y:number,size:number,font=regular)=>page.drawText(clean(text),{x:(pageWidth-font.widthOfTextAtSize(clean(text),size))/2,y,size,font});
  center("Officina22",790,21,bold);center("Prenotazioni - "+service.toUpperCase(),768,13,bold);center(title,750,11);
  center(`${rows.length} prenotazioni   |   ${rows.reduce((a,r)=>a+r.guests,0)} coperti   |   ${rows.reduce((a,r)=>a+(r.baby||0),0)} baby`,733,10);
  return page;
 }
 let page=newPage(),column=0,y=top;
 const nextColumn=()=>{if(column+1<columns){column++;y=top}else{page=newPage();column=0;y=top}};
 for(const item of cards){
  if(y-item.height<bottom&&y<top)nextColumn();
  // Split exceptionally long notes safely rather than clipping or omitting them.
  let offset=0;
  while(offset<item.lines.length){
   const x=columns===1?(pageWidth-width)/2:margin+column*(width+gap);
   let used=12,end=offset;
   while(end<item.lines.length&&used+item.lines[end].size+2<=y-bottom){used+=item.lines[end].size+2;end++}
   if(end===offset){nextColumn();continue}
   page.drawRectangle({x,y:y-used,width,height:used,borderColor:rgb(.65,.65,.65),borderWidth:.5});
   page.drawRectangle({x:x+8,y:y-23,width:11,height:11,borderColor:rgb(0,0,0),borderWidth:1});
   if(item.r.arrived){page.drawLine({start:{x:x+10,y:y-17},end:{x:x+13,y:y-21},thickness:1.2});page.drawLine({start:{x:x+13,y:y-21},end:{x:x+18,y:y-14},thickness:1.2})}
   let textY=y-8;
   for(const line of item.lines.slice(offset,end)){textY-=line.size;page.drawText(line.text,{x:x+27,y:textY,size:line.size,font:line.font});textY-=2}
   y-=used+6;offset=end;
   if(offset<item.lines.length)nextColumn();
  }
 }
 if(!rows.length)page.drawText("Nessuna prenotazione per questo servizio",{x:160,y:690,size:11,font:regular});
 const pages=pdf.getPages();pages.forEach((page,i)=>page.drawText(`${i+1} / ${pages.length}`,{x:pageWidth-55,y:17,size:8,font:regular}));
 return pdf.save();
}
