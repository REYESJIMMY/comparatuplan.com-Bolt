"use client";
import { useState, useEffect, useRef } from "react";
import { getPlanes } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import {
  Wifi, Zap, Search, Shield, Check, ArrowRight,
  Globe, User, Building, Tv, Smartphone,
  Briefcase, BookOpen, Send, X, ChevronDown, MessageCircle,
  Bell, Gift, Home, LogIn, UserPlus, ChevronRight, Network,
  Headphones, Tag, ShoppingCart, Wrench, Phone, Bot,
  MapPin, Package, Trash2, Plus, Minus, Menu, Star, Settings
} from "lucide-react";

const C = {
  bg:"#04040f",bg2:"#080620",neon:"#00d4ff",neon2:"#a855f7",
  pink:"#ec4899",green:"#10b981",yellow:"#f59e0b",red:"#ef4444",
  cyan:"#00e5ff",accent:"#ff6b35",text:"#fff",muted:"rgba(180,190,220,0.5)",
  border:"rgba(0,212,255,0.15)",borderSoft:"rgba(255,255,255,0.06)"
};
const WA = "573057876992";
const openWA = (n: string) => window.open(`https://wa.me/${WA}?text=${encodeURIComponent(`Hola, vi *${n}* en ComparaTuPlan y quiero más información 🚀`)}`, "_blank");

/* ═══ ATOMS ═══ */
const WaIco = ({s=14}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);
const GlowBtn = ({children,onClick,disabled,gradient,glow,style={},full}: any) => {
  const g = gradient||"linear-gradient(135deg,#00d4ff22,#a855f722)";
  const gl = glow||C.neon;
  return(
    <button onClick={onClick} disabled={disabled}
      style={{width:full?"100%":undefined,background:disabled?"rgba(255,255,255,0.05)":g,color:disabled?"#444":"#fff",border:disabled?"1px solid rgba(255,255,255,0.07)":`1px solid ${gl}44`,borderRadius:10,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:disabled?"default":"pointer",boxShadow:disabled?"none":`0 0 18px ${gl}33`,transition:"all .2s",...style}}
      onMouseEnter={(e:any)=>{if(!disabled){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 4px 28px ${gl}55`;}}}
      onMouseLeave={(e:any)=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=disabled?"none":`0 0 18px ${gl}33`;}}
    >{children}</button>
  );
};
const WABtn = ({name,label="Lo Quiero",full,style={}}: any) => (
  <button onClick={()=>openWA(name)} style={{width:full?"100%":undefined,background:"linear-gradient(135deg,#25d366,#128c7e)",color:"#fff",border:"none",borderRadius:10,padding:"10px 16px",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"transform .15s",...style}}
    onMouseEnter={(e:any)=>e.currentTarget.style.transform="translateY(-2px)"}
    onMouseLeave={(e:any)=>e.currentTarget.style.transform=""}
  ><WaIco/>{label}</button>
);
const Card = ({children,style={},glow,onClick}: any) => (
  <div onClick={onClick} style={{background:"rgba(8,6,28,0.8)",border:`1px solid ${glow?glow+"28":C.borderSoft}`,borderRadius:16,backdropFilter:"blur(16px)",boxShadow:glow?`0 0 24px ${glow}12`:"none",transition:"all .2s",...style}}>{children}</div>
);
const Chip = ({children,color=C.neon}: any) => (
  <span style={{background:`${color}14`,border:`1px solid ${color}33`,color,borderRadius:99,padding:"2px 10px",fontSize:10,fontWeight:800,letterSpacing:.5,whiteSpace:"nowrap"}}>{children}</span>
);

/* ═══ PARTICLES ═══ */
const Particles = ({count=35}: any) => {
  const ref = useRef<any>(null);
  useEffect(()=>{
    const c=ref.current; if(!c)return;
    const ctx=c.getContext("2d");
    c.width=c.offsetWidth; c.height=c.offsetHeight;
    const pts=Array.from({length:count},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.3}));
    let raf: any;
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach((p:any)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>c.width)p.vx*=-1;if(p.y<0||p.y>c.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(0,212,255,.35)";ctx.fill();});
      pts.forEach((a:any,i:number)=>(pts as any[]).slice(i+1).forEach((b:any)=>{const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<80){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(0,212,255,${.08*(1-d/80)})`;ctx.lineWidth=.5;ctx.stroke();}}));
      raf=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
};

/* ═══ OPERATORS SLIDER ═══ */
const OPS = [
  {n:"Claro",c:"#e2001a",e:"🔴"},{n:"Movistar",c:"#00aa44",e:"🟢"},{n:"Tigo",c:"#00a0e3",e:"🔵"},
  {n:"ETB",c:"#f59e0b",e:"🟡"},{n:"WOM",c:"#a855f7",e:"🟣"},{n:"Virgin Mobile",c:"#ef4444",e:"🔴"},
  {n:"Avantel",c:"#06b6d4",e:"🔵"},{n:"Uff Móvil",c:"#f97316",e:"🟠"},{n:"Flash Mobile",c:"#6366f1",e:"🟣"},
  {n:"Éxito Móvil",c:"#10b981",e:"🟢"},{n:"Alkosto Móvil",c:"#ef4444",e:"🔴"},{n:"Telefónica",c:"#0084ff",e:"🔵"},
  {n:"DirecTV",c:"#00c8ff",e:"🔵"},{n:"Starlink",c:"#6366f1",e:"🌐"},{n:"InterNexa",c:"#10b981",e:"🟢"},{n:"GT Internet",c:"#f59e0b",e:"🟡"},
];
const OpsSlider = () => {
  const doubled = [...OPS,...OPS];
  return(
    <div style={{overflow:"hidden",position:"relative",padding:"14px 0",background:"rgba(4,4,15,0.9)",borderTop:`1px solid ${C.borderSoft}`,borderBottom:`1px solid ${C.borderSoft}`}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:60,background:"linear-gradient(90deg,#04040f,transparent)",zIndex:2,pointerEvents:"none"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:60,background:"linear-gradient(270deg,#04040f,transparent)",zIndex:2,pointerEvents:"none"}}/>
      <div style={{display:"flex",gap:12,animation:"slideLeft 28s linear infinite",width:"max-content"}}>
        {doubled.map((op,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:7,background:`${op.c}10`,border:`1px solid ${op.c}28`,borderRadius:99,padding:"6px 16px",flexShrink:0,cursor:"default",transition:"all .2s",whiteSpace:"nowrap"}}
            onMouseEnter={(e:any)=>{e.currentTarget.style.background=`${op.c}22`;e.currentTarget.style.transform="scale(1.05)";}}
            onMouseLeave={(e:any)=>{e.currentTarget.style.background=`${op.c}10`;e.currentTarget.style.transform="";}}
          >
            <span style={{fontSize:12}}>{op.e}</span>
            <span style={{color:op.c,fontWeight:700,fontSize:11.5}}>{op.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══ MEGA MENU ═══ */
const MENUS: any = {
  home:{label:"Home",icon:"🏠",sections:[
    {title:"Navegar",color:C.neon,items:[
      {ic:"🏠",t:"Inicio",d:"Página principal"},
      {ic:"🔍",t:"Comparar Planes",d:"Busca y ahorra"},
      {ic:"⭐",t:"Más Populares",d:"Top planes del mes"},
      {ic:"📊",t:"Ranking Operadores",d:"Mejor valorados"},
    ]},
    {title:"Herramientas",color:C.neon2,items:[
      {ic:"🏠",t:"Diseñar Hogar Digital",d:"Configura tu casa",action:"game"},
      {ic:"🧮",t:"Calculadora de Ahorro",d:"Cuánto puedes ahorrar"},
      {ic:"📡",t:"Test de Velocidad",d:"Mide tu conexión"},
      {ic:"🗺️",t:"Cobertura",d:"Zonas disponibles"},
    ]},
  ]},
  ecosistema:{label:"Ecosistema",icon:"🌐",sections:[
    {title:"Servicio Técnico",color:C.yellow,items:[
      {ic:"🔧",t:"Reparación Dispositivos",d:"Laptops, PC, móviles"},
      {ic:"💻",t:"Laptops & PCs",d:"Diagnóstico gratis"},
      {ic:"📱",t:"Smartphones",d:"Pantallas, batería"},
      {ic:"📡",t:"Redes & WiFi",d:"Instalación y config."},
    ]},
    {title:"Marketplace Tech",color:C.cyan,items:[
      {ic:"📶",t:"Equipos WiFi",d:"Routers, mesh, extenders"},
      {ic:"🎮",t:"Gaming Gear",d:"PCs, consolas, periféricos"},
      {ic:"🖥️",t:"Monitores",d:"144Hz, 4K, ultrawide"},
      {ic:"🔋",t:"Accesorios Tech",d:"Cables, cargadores"},
    ]},
  ]},
  empresas:{label:"Empresas",icon:"🏢",sections:[
    {title:"Comunicaciones",color:C.neon,items:[
      {ic:"☎️",t:"PBX Virtual",d:"Central en la nube"},
      {ic:"💬",t:"WhatsApp IA",d:"Chatbots y automatización"},
      {ic:"🎙️",t:"VoIP Empresarial",d:"Llamadas sobre IP"},
      {ic:"📞",t:"Contact Center",d:"Multiagente y reportes"},
    ]},
    {title:"Conectividad B2B",color:C.neon2,items:[
      {ic:"🏢",t:"Fibra Dedicada",d:"Exclusiva para tu negocio"},
      {ic:"☁️",t:"Cloud & SD-WAN",d:"Redes privadas"},
      {ic:"🛡️",t:"Ciberseguridad",d:"Protección 360°"},
      {ic:"📊",t:"Analítica BI",d:"Dashboard ejecutivo"},
    ]},
  ]},
  refiere:{label:"Refiere & Gana",icon:"🎁",badge:"🎁",badgeColor:C.neon2,sections:[
    {title:"Premios",color:C.yellow,items:[
      {ic:"🎁",t:"Premios Tech",d:"Gana productos"},
      {ic:"💰",t:"Cashback",d:"Hasta $200.000"},
      {ic:"🎟️",t:"Bonos Sodexo",d:"Miles de canjes"},
      {ic:"⭐",t:"Puntos VIP",d:"Acumula y canjea"},
    ]},
    {title:"Cómo Funciona",color:C.green,items:[
      {ic:"1️⃣",t:"Comparte tu link",d:"Invita amigos"},
      {ic:"2️⃣",t:"Ellos comparan",d:"Encuentran su plan"},
      {ic:"3️⃣",t:"Contratan",d:"Plan activo y verificado"},
      {ic:"4️⃣",t:"Tú Ganas",d:"Premio automático"},
    ]},
  ]},
  asesores:{label:"Asesores",icon:"🎧",badge:"PRO",badgeColor:C.yellow,sections:[
    {title:"Herramientas",color:C.neon,items:[
      {ic:"💼",t:"CRM Asesores",d:"Gestiona tus clientes"},
      {ic:"💵",t:"Comisiones",d:"Seguimiento real-time"},
      {ic:"🎓",t:"Capacitación",d:"Cursos y certificaciones"},
      {ic:"📊",t:"Métricas",d:"Tus estadísticas"},
    ]},
    {title:"Beneficios",color:C.green,items:[
      {ic:"🏆",t:"Ranking",d:"Compite con asesores"},
      {ic:"🎁",t:"Bonos Extra",d:"Por metas cumplidas"},
      {ic:"📱",t:"App Asesor",d:"Gestiona desde móvil"},
      {ic:"🤝",t:"Soporte Dedicado",d:"Equipo exclusivo"},
    ]},
  ]},
  social:{label:"Conexión Social",icon:"🛡️",badge:"GRATIS",badgeColor:C.green,sections:[
    {title:"Programa Distrito",color:C.green,items:[
      {ic:"🏠",t:"Internet Gratis",d:"Hogares estrato 1 y 2"},
      {ic:"📋",t:"Requisitos",d:"Consulta si calificas"},
      {ic:"🆔",t:"Registro",d:"Proceso gratuito"},
      {ic:"📡",t:"Instalación",d:"Sin costo"},
    ]},
    {title:"Beneficios",color:C.cyan,items:[
      {ic:"👨‍👩‍👧‍👦",t:"Familias",d:"Acceso digital"},
      {ic:"🎓",t:"Educación",d:"Plataformas educativas"},
      {ic:"💼",t:"Teletrabajo",d:"Trabaja desde casa"},
      {ic:"🏥",t:"Telemedicina",d:"Salud online"},
    ]},
  ]},
  ofertas:{label:"Ofertas",icon:"⚡",badge:"HOT",badgeColor:C.red,sections:[
    {title:"Planes",color:C.red,items:[
      {ic:"⚡",t:"Flash Deals",d:"Solo hoy"},
      {ic:"🎁",t:"Combos Familia",d:"Ahorra hasta 40%"},
      {ic:"📦",t:"Triple Play",d:"Internet+TV+Móvil"},
      {ic:"🆕",t:"Nuevos Clientes",d:"Bono bienvenida"},
    ]},
    {title:"Equipos",color:C.neon2,items:[
      {ic:"📡",t:"Routers WiFi 6",d:"Desde $89.900"},
      {ic:"🎮",t:"Gaming Gear",d:"Hasta 50% off"},
      {ic:"💻",t:"Laptops",d:"Garantía 1 año"},
      {ic:"📱",t:"Smartphones",d:"Planes desde $0"},
    ]},
  ]},
};

const MegaPanel = ({id,onClose,onAction}: any) => {
  const data = MENUS[id]; if(!data) return null;
  return(
    <div style={{position:"absolute",top:"calc(100% + 2px)",left:"50%",transform:"translateX(-50%)",zIndex:600,background:"rgba(6,4,20,0.98)",border:`1px solid ${C.border}`,borderRadius:16,padding:22,minWidth:460,maxWidth:520,boxShadow:`0 24px 80px rgba(0,0,0,0.85),0 0 0 1px rgba(0,212,255,0.06)`,backdropFilter:"blur(32px)",animation:"megaIn .18s ease-out"}}
      onMouseLeave={onClose}
    >
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {data.sections.map((sec: any,si: number)=>(
          <div key={si}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <div style={{width:3,height:12,background:sec.color,borderRadius:99}}/>
              <span style={{color:sec.color,fontSize:9,fontWeight:800,letterSpacing:1.5}}>{sec.title.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {sec.items.map((it: any,ii: number)=>(
                <div key={ii} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:10,cursor:"pointer",border:"1px solid transparent",transition:"all .14s"}}
                  onMouseEnter={(e:any)=>{e.currentTarget.style.background=`${sec.color}0c`;e.currentTarget.style.borderColor=`${sec.color}22`;}}
                  onMouseLeave={(e:any)=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";}}
                  onClick={()=>{if(it.action)onAction(it.action);onClose();}}
                >
                  <div style={{width:30,height:30,borderRadius:8,background:`${sec.color}14`,border:`1px solid ${sec.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{it.ic}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:"#e8eaf6",fontWeight:700,fontSize:12}}>{it.t}</div>
                    <div style={{color:C.muted,fontSize:10,marginTop:1}}>{it.d}</div>
                  </div>
                  <ChevronRight size={10} color={C.muted} style={{opacity:.4,flexShrink:0}}/>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══ HEADER ═══ */
const Header = ({onSearch,onLogin,onRegister,cartCount,onCart}: any) => {
  const [active,setActive]=useState<any>(null);
  const [scrolled,setScrolled]=useState(false);
  const [notifs,setNotifs]=useState(3);
  const timerRef=useRef<any>(null);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>8);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  const enter=(id: any)=>{clearTimeout(timerRef.current);setActive(id);};
  const leave=()=>{timerRef.current=setTimeout(()=>setActive(null),160);};
  return(
    <header style={{position:"fixed",top:0,left:0,right:0,zIndex:500}}>
      <div style={{background:"linear-gradient(90deg,#0a0060,#1a0080,#0a0060)",borderBottom:"1px solid rgba(0,212,255,0.12)",padding:"5px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:16}}>
          {[["📞","+57 305 787 6992"],["📍","Bogotá, Colombia"],["🕐","Atención 24/7"]].map(([ic,t])=>(
            <span key={t} style={{color:"rgba(180,200,255,0.6)",fontSize:10.5,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>{ic} {t}</span>
          ))}
        </div>
        <span style={{background:"linear-gradient(90deg,#00d4ff,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:11,fontWeight:800}}>⚡ ¡Ahorra hasta 40% hoy! Comparamos +15 operadores</span>
      </div>
      <div style={{background:scrolled?"rgba(4,4,15,0.97)":"rgba(4,4,15,0.92)",backdropFilter:"blur(28px)",borderBottom:`1px solid ${scrolled?"rgba(0,212,255,0.18)":C.borderSoft}`,boxShadow:scrolled?"0 8px 40px rgba(0,0,0,0.6)":"none",transition:"all .3s"}}>
        <div style={{maxWidth:1380,margin:"0 auto",padding:"0 22px",height:62,display:"flex",alignItems:"center",gap:0}}>
          <a href="#" style={{display:"flex",alignItems:"center",gap:11,textDecoration:"none",flexShrink:0,marginRight:28,padding:"8px 0"}}>
            <div style={{position:"relative"}}>
              <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#00d4ff,#0080ff)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px #00d4ff55,0 0 40px #00d4ff22"}}>
                <Zap size={20} color="#fff" strokeWidth={2.5}/>
              </div>
              <div style={{position:"absolute",top:-2,right:-2,width:10,height:10,background:"#ff6b35",borderRadius:"50%",border:"2px solid #04040f",animation:"pulse 2s infinite"}}/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"baseline",gap:0}}>
                <span style={{fontWeight:900,fontSize:17,color:"#fff",letterSpacing:"-0.5px",lineHeight:1}}>Compara</span>
                <span style={{fontWeight:900,fontSize:17,background:"linear-gradient(90deg,#00d4ff,#0080ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.5px",lineHeight:1}}>Tu</span>
                <span style={{fontWeight:900,fontSize:17,color:"#ff6b35",letterSpacing:"-0.5px",lineHeight:1}}>Plan</span>
                <span style={{fontWeight:700,fontSize:12,color:"rgba(0,212,255,0.6)",letterSpacing:"-0.3px",lineHeight:1}}>.com</span>
              </div>
              <div style={{fontSize:7.5,fontWeight:700,letterSpacing:1.8,color:"rgba(0,212,255,0.4)",marginTop:2}}>COLOMBIA · TELCO #1</div>
            </div>
          </a>
          <nav style={{display:"flex",alignItems:"center",gap:2,flex:1}}>
            {Object.entries(MENUS).map(([id,m]: any)=>(
              <div key={id} style={{position:"relative",flexShrink:0}} onMouseEnter={()=>enter(id)} onMouseLeave={leave}>
                <button style={{display:"flex",alignItems:"center",gap:5,padding:"8px 11px",borderRadius:9,background:active===id?"rgba(0,212,255,0.08)":"transparent",border:`1px solid ${active===id?"rgba(0,212,255,0.2)":"transparent"}`,color:active===id?"#fff":"rgba(180,195,230,0.7)",fontWeight:600,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s",fontFamily:"inherit",boxShadow:active===id?"0 0 12px rgba(0,212,255,0.12)":"none"}}>
                  <span style={{fontSize:13}}>{m.icon}</span>
                  <span>{m.label}</span>
                  {m.badge&&<Chip color={m.badgeColor}>{m.badge}</Chip>}
                  <ChevronDown size={11} style={{transition:"transform .2s",transform:active===id?"rotate(180deg)":"rotate(0)",opacity:.5}}/>
                </button>
                {active===id&&(
                  <MegaPanel id={id} onClose={()=>setActive(null)}
                    onAction={(a: string)=>{if(a==="game")document.dispatchEvent(new CustomEvent("navAction",{detail:"game"}));}}
                  />
                )}
              </div>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:12}}>
            <button onClick={onSearch} title="Buscar (⌘K)" style={{width:36,height:36,borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,color:"rgba(180,195,230,0.6)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
              onMouseEnter={(e:any)=>{e.currentTarget.style.background="rgba(0,212,255,0.1)";e.currentTarget.style.borderColor="rgba(0,212,255,0.3)";e.currentTarget.style.color="#fff";}}
              onMouseLeave={(e:any)=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=C.borderSoft;e.currentTarget.style.color="rgba(180,195,230,0.6)";}}
            ><Search size={15}/></button>
            <button title="Notificaciones" style={{position:"relative",width:36,height:36,borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,color:"rgba(180,195,230,0.6)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
              onMouseEnter={(e:any)=>{e.currentTarget.style.background="rgba(0,212,255,0.1)";e.currentTarget.style.color="#fff";}}
              onMouseLeave={(e:any)=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="rgba(180,195,230,0.6)";}}
              onClick={()=>setNotifs(0)}
            >
              <Bell size={15}/>
              {notifs>0&&<span style={{position:"absolute",top:-3,right:-3,width:16,height:16,borderRadius:"50%",background:C.red,color:"#fff",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #04040f"}}>{notifs}</span>}
            </button>
            <button title="Carrito" onClick={onCart} style={{position:"relative",width:36,height:36,borderRadius:9,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,color:"rgba(180,195,230,0.6)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
              onMouseEnter={(e:any)=>{e.currentTarget.style.background="rgba(0,212,255,0.1)";e.currentTarget.style.borderColor="rgba(0,212,255,0.3)";e.currentTarget.style.color="#fff";}}
              onMouseLeave={(e:any)=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=C.borderSoft;e.currentTarget.style.color="rgba(180,195,230,0.6)";}}
            >
              <ShoppingCart size={15}/>
              {cartCount>0&&<span style={{position:"absolute",top:-3,right:-3,width:16,height:16,borderRadius:"50%",background:C.neon,color:"#04040f",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #04040f"}}>{cartCount}</span>}
            </button>
            <div style={{width:1,height:28,background:C.borderSoft,margin:"0 2px"}}/>
            <button onClick={()=>openWA("asesoría")} style={{display:"flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#1aab58,#0d7a3e)",border:"1px solid rgba(37,211,102,0.25)",borderRadius:9,padding:"8px 13px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",boxShadow:"0 0 14px rgba(37,211,102,0.2)",transition:"all .15s"}}
              onMouseEnter={(e:any)=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 20px rgba(37,211,102,0.35)";}}
              onMouseLeave={(e:any)=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 0 14px rgba(37,211,102,0.2)";}}
            ><WaIco/>Asesor</button>
            <button onClick={onLogin} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:`1px solid rgba(0,212,255,0.25)`,borderRadius:9,padding:"8px 13px",color:"rgba(0,212,255,0.85)",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={(e:any)=>{e.currentTarget.style.background="rgba(0,212,255,0.08)";e.currentTarget.style.borderColor="rgba(0,212,255,0.5)";}}
              onMouseLeave={(e:any)=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(0,212,255,0.25)";}}
            ><LogIn size={13}/>Ingresar</button>
            <button onClick={onRegister} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#0070cc,#0050aa)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:9,padding:"8px 13px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",boxShadow:"0 0 14px rgba(0,212,255,0.2)",transition:"all .15s"}}
              onMouseEnter={(e:any)=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,212,255,0.35)";}}
              onMouseLeave={(e:any)=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 0 14px rgba(0,212,255,0.2)";}}
            ><UserPlus size={13}/>Registro</button>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ═══ CART DRAWER ═══ */
const CartDrawer = ({cart,setCart,open,onClose}: any) => {
  const total = cart.reduce((s: number,i: any)=>s+i.price*i.qty,0);
  const upd = (id: any,d: number) => setCart((p: any[])=>{const n=[...p];const idx=n.findIndex((x: any)=>x.id===id);if(idx===-1)return p;n[idx]={...n[idx],qty:n[idx].qty+d};return n.filter((x: any)=>x.qty>0);});
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,display:"flex"}} onClick={onClose}>
      <div style={{flex:1,background:"rgba(4,4,15,0.65)",backdropFilter:"blur(8px)"}}/>
      <div style={{width:340,background:"rgba(6,4,20,0.99)",borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",animation:"slideRight .22s ease-out"}} onClick={(e: any)=>e.stopPropagation()}>
        <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.borderSoft}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><ShoppingCart size={17} color={C.neon}/><span style={{color:"#fff",fontWeight:800,fontSize:14}}>Carrito</span><span style={{background:C.neon,color:"#04040f",borderRadius:99,width:19,height:19,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900}}>{cart.reduce((s: number,i: any)=>s+i.qty,0)}</span></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.borderSoft}`,borderRadius:8,width:28,height:28,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:9}}>
          {cart.length===0?(
            <div style={{textAlign:"center",padding:"50px 0",color:C.muted}}><ShoppingCart size={36} style={{margin:"0 auto 10px",opacity:.25}}/><div style={{fontSize:13}}>Tu carrito está vacío</div></div>
          ):cart.map((item: any)=>(
            <div key={item.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.borderSoft}`,borderRadius:11,padding:"10px 11px",display:"flex",gap:9,alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${item.color||C.neon}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{item.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:"#fff",fontWeight:700,fontSize:11,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                <div style={{color:item.color||C.neon,fontWeight:800,fontSize:12}}>{item.price===0?"GRATIS":`$${(item.price*item.qty).toLocaleString()}`}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <button onClick={()=>upd(item.id,-1)} style={{width:22,height:22,borderRadius:6,background:"rgba(255,255,255,0.06)",border:`1px solid ${C.borderSoft}`,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Minus size={10}/></button>
                <span style={{color:"#fff",fontSize:12,fontWeight:700,minWidth:14,textAlign:"center"}}>{item.qty}</span>
                <button onClick={()=>upd(item.id,1)} style={{width:22,height:22,borderRadius:6,background:"rgba(255,255,255,0.06)",border:`1px solid ${C.borderSoft}`,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={10}/></button>
              </div>
            </div>
          ))}
        </div>
        {cart.length>0&&(
          <div style={{padding:"13px 14px",borderTop:`1px solid ${C.borderSoft}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:11}}><span style={{color:C.muted,fontSize:12}}>Total</span><span style={{color:"#fff",fontWeight:900,fontSize:16}}>${total.toLocaleString()}</span></div>
            <WABtn name={`carrito (${cart.length} items, $${total.toLocaleString()})`} label="Finalizar por WhatsApp" full style={{borderRadius:10}}/>
            <button onClick={()=>setCart([])} style={{width:"100%",marginTop:7,background:"transparent",border:`1px solid ${C.borderSoft}`,borderRadius:9,padding:"7px 0",color:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>Vaciar carrito</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══ SEARCH ═══ */
const SearchBar = ({open,onClose}: any) => {
  const [q,setQ]=useState(""); const ref=useRef<any>(null);
  useEffect(()=>{if(open){ref.current?.focus();setQ("");}});
  const sug=["Fibra óptica Bogotá","Plan móvil 20GB","Internet+TV combo","Portabilidad","Reparación laptop","PBX virtual pyme","Router WiFi 6"].filter(s=>q?s.toLowerCase().includes(q.toLowerCase()):true).slice(0,5);
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(4,4,15,0.96)",backdropFilter:"blur(22px)",display:"flex",flexDirection:"column",alignItems:"center",padding:"110px 24px 40px"}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:560}} onClick={(e:any)=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:11,background:"rgba(255,255,255,0.04)",border:`2px solid ${C.neon}`,borderRadius:14,padding:"12px 16px",boxShadow:`0 0 40px ${C.neon}22`}}>
          <Search size={17} color={C.neon}/><input ref={ref} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Escape"&&onClose()} placeholder="Buscar planes, operadores, servicios…" style={{flex:1,background:"transparent",border:"none",color:"#fff",fontSize:15,outline:"none",fontFamily:"inherit"}}/>
          <kbd onClick={onClose} style={{color:C.muted,fontSize:10,border:`1px solid ${C.borderSoft}`,borderRadius:5,padding:"2px 8px",cursor:"pointer"}}>ESC</kbd>
        </div>
        {sug.length>0&&(<div style={{marginTop:7,background:"rgba(8,6,28,0.99)",border:`1px solid ${C.borderSoft}`,borderRadius:11,overflow:"hidden"}}>
          {sug.map((s,i)=>(<div key={i} style={{padding:"10px 15px",color:"#c8d0f0",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:9,borderBottom:i<sug.length-1?`1px solid ${C.borderSoft}`:"none",transition:"background .12s"}}
            onMouseEnter={(e:any)=>e.currentTarget.style.background="rgba(0,212,255,0.06)"}
            onMouseLeave={(e:any)=>e.currentTarget.style.background="transparent"}
          ><Search size={11} color={C.muted}/>{s}</div>))}
        </div>)}
        <div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap"}}>
          {["Internet","Móvil","TV","Empresas","Gaming","WiFi"].map(t=>(
            <span key={t} onClick={()=>setQ(t)} style={{background:"rgba(0,212,255,0.08)",border:`1px solid ${C.border}`,color:C.neon,borderRadius:99,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══ AUTH MODAL ═══ */
const AuthModal = ({mode,onClose}: any) => {
  const [tab,setTab]=useState(mode||"login"); const isL=tab==="login";
  return(
    <div style={{position:"fixed",inset:0,zIndex:9998,background:"rgba(4,4,15,0.92)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}>
      <div style={{background:"rgba(8,6,24,0.99)",border:`1px solid ${C.border}`,borderRadius:20,padding:28,maxWidth:360,width:"100%",boxShadow:`0 0 80px ${C.neon}14`,position:"relative"}} onClick={(e:any)=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.05)",border:"none",borderRadius:"50%",width:27,height:27,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
        <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:9,padding:3,marginBottom:20}}>
          {[["login","Iniciar Sesión"],["register","Registrarse"]].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",background:tab===id?"linear-gradient(135deg,#0070cc,#0050aa)":"transparent",color:tab===id?"#fff":C.muted,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .18s"}}>{l}</button>
          ))}
        </div>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{width:42,height:42,borderRadius:11,background:"linear-gradient(135deg,#0070cc,#0050aa)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 9px"}}>{isL?<LogIn size={18} color="#fff"/>:<UserPlus size={18} color="#fff"/>}</div>
          <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{isL?"¡Bienvenido!":"Crea tu cuenta gratis"}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {!isL&&<input placeholder="Nombre completo" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,borderRadius:9,padding:"10px 13px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit"}}/>}
          <input placeholder="Correo electrónico" type="email" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,borderRadius:9,padding:"10px 13px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit"}}/>
          <input placeholder="Contraseña" type="password" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,borderRadius:9,padding:"10px 13px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit"}}/>
        </div>
        <button onClick={onClose} style={{width:"100%",marginTop:13,background:"linear-gradient(135deg,#0070cc,#0050aa)",border:"none",borderRadius:9,padding:"11px 0",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:`0 0 18px ${C.neon}33`}}>{isL?"Entrar":"Crear cuenta"}</button>
        <div style={{display:"flex",alignItems:"center",gap:9,margin:"11px 0"}}>
          <div style={{flex:1,height:1,background:C.borderSoft}}/><span style={{color:C.muted,fontSize:10}}>o continúa con</span><div style={{flex:1,height:1,background:C.borderSoft}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[["G","#ea4335","Google"],["f","#1877f2","Facebook"]].map(([l,col,name])=>(
            <button key={name} style={{flex:1,padding:"8px 0",borderRadius:9,background:`${col}12`,border:`1px solid ${col}25`,color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <span style={{color:col,fontWeight:900,fontSize:13}}>{l}</span>{name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══ CHATBOT ═══ */
const getReply = (t: string) => {
  t=t.toLowerCase();
  if(t.match(/hola|buenas|hey/)) return "¡Hola! 👋 Soy **Nexus**. ¿En qué te ayudo?";
  if(t.match(/internet|fibra/)) return "📡 Fibra desde **$59.900/mes** hasta 600 Mbps.";
  if(t.match(/precio|costo|cuánto/)) return "💰 Planes desde **$45.900/mes**. ¡Hasta 40% de ahorro!";
  if(t.match(/móvil|movil|celular/)) return "📱 Datos ilimitados desde **$55.900/mes**.";
  if(t.match(/reparar|técnico|roto/)) return "🔧 Servicio técnico disponible. Diagnóstico **gratis**.";
  return "Para asesoría personalizada escríbenos por **WhatsApp** 💬";
};
const Chatbot = () => {
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState<any[]>([{from:"bot",text:"¡Hola! 👋 Soy **Nexus**. ¿Cómo puedo ayudarte?"}]);
  const [input,setInput]=useState(""); const [typing,setTyping]=useState(false); const [unread,setUnread]=useState(1);
  const botRef=useRef<any>(null); const inputRef=useRef<any>(null);
  useEffect(()=>{botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  useEffect(()=>{if(open){setUnread(0);setTimeout(()=>inputRef.current?.focus(),80);}},[open]);
  const send=(t?: string)=>{const m=t||input.trim();if(!m)return;setInput("");setMsgs(p=>[...p,{from:"user",text:m}]);setTyping(true);setTimeout(()=>{setMsgs(p=>[...p,{from:"bot",text:getReply(m)}]);setTyping(false);},750+Math.random()*400);};
  const rt=(t: string)=>t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
  return(
    <>
      <div style={{position:"fixed",bottom:24,right:24,zIndex:1000}}>
        <button onClick={()=>setOpen(o=>!o)} style={{width:50,height:50,borderRadius:"50%",background:open?"linear-gradient(135deg,#ef4444,#b91c1c)":"linear-gradient(135deg,#00d4ff,#0070cc)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 22px ${open?"#ef444488":"#00d4ff66"}`,position:"relative",transition:"all .2s"}}>
          {open?<X size={19} color="#fff"/>:<MessageCircle size={21} color="#fff"/>}
          {unread>0&&!open&&<span style={{position:"absolute",top:-3,right:-3,width:16,height:16,borderRadius:"50%",background:C.red,color:"#fff",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #04040f"}}>{unread}</span>}
        </button>
      </div>
      {open&&(
        <div style={{position:"fixed",bottom:84,right:24,zIndex:999,width:295,display:"flex",flexDirection:"column",background:"rgba(6,4,20,0.99)",border:`1px solid ${C.border}`,borderRadius:18,boxShadow:`0 0 50px ${C.neon}18`,backdropFilter:"blur(24px)",overflow:"hidden"}}>
          <div style={{background:"linear-gradient(135deg,#0070cc,#0050aa)",padding:"11px 14px",display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><MessageCircle size={15} color="#fff"/></div>
            <div style={{flex:1}}><div style={{color:"#fff",fontWeight:800,fontSize:13}}>Nexus IA</div><div style={{color:"rgba(255,255,255,0.6)",fontSize:9,fontWeight:600}}>● En línea</div></div>
            <button onClick={()=>setOpen(false)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:23,height:23,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={11} color="#fff"/></button>
          </div>
          <div style={{overflowY:"auto",padding:"9px 9px 4px",display:"flex",flexDirection:"column",gap:7,maxHeight:210}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"80%",padding:"7px 11px",borderRadius:m.from==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.from==="user"?"linear-gradient(135deg,#0070cc,#0050aa)":"rgba(255,255,255,0.06)",color:"#fff",fontSize:11,lineHeight:1.5}} dangerouslySetInnerHTML={{__html:rt(m.text)}}/>
              </div>
            ))}
            {typing&&<div style={{display:"flex"}}><div style={{padding:"7px 11px",borderRadius:"14px 14px 14px 3px",background:"rgba(255,255,255,0.06)",display:"flex",gap:3,alignItems:"center"}}>{[0,1,2].map(j=><div key={j} style={{width:4,height:4,borderRadius:"50%",background:C.neon,animation:`blink 1.2s ${j*.2}s infinite`}}/>)}</div></div>}
            <div ref={botRef}/>
          </div>
          <div style={{padding:"4px 7px",display:"flex",gap:4,flexWrap:"wrap"}}>
            {["Planes","Precios","Técnico","Asesor"].map(q=>(
              <button key={q} onClick={()=>send(q)} style={{background:"rgba(0,212,255,0.08)",border:`1px solid ${C.border}`,color:C.neon,borderRadius:99,padding:"3px 8px",fontSize:9,fontWeight:700,cursor:"pointer"}}>{q}</button>
            ))}
          </div>
          <div style={{padding:"5px 7px 9px",display:"flex",gap:5}}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Escribe tu pregunta…" style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.borderSoft}`,borderRadius:8,padding:"7px 10px",color:"#fff",fontSize:11,outline:"none"}}/>
            <button onClick={()=>send()} style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#0070cc,#0050aa)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Send size={12} color="#fff"/></button>
          </div>
        </div>
      )}
    </>
  );
};

const HouseSVG = ({floor2,devices,flash}: any) => {
  const mx=200,my=floor2?195:148;
  return(
    <svg viewBox="0 0 400 320" style={{width:"100%",maxWidth:400,display:"block",margin:"0 auto"}}>
      <defs>
        <radialGradient id="hGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={flash?"#10b981":"#00d4ff"} stopOpacity={flash?1:.8}/><stop offset="100%" stopColor={flash?"#10b981":"#00d4ff"} stopOpacity={0}/></radialGradient>
        <filter id="gf"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <ellipse cx="200" cy="306" rx="165" ry="9" fill="rgba(0,212,255,0.12)"/>
      <rect x="58" y={floor2?190:145} width="284" height="123" rx="4" fill="rgba(6,4,20,0.92)" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity=".35"/>
      <polygon points={`38,${floor2?192:147} 200,${floor2?100:60} 362,${floor2?192:147}`} fill="rgba(0,212,255,0.1)" stroke="#00d4ff" strokeWidth="1.8" strokeOpacity=".5"/>
      {floor2&&<>
        <rect x="78" y="110" width="244" height="82" rx="4" fill="rgba(6,4,20,0.88)" stroke="#a855f7" strokeWidth="1.5" strokeOpacity=".35"/>
        <polygon points="58,112 200,38 342,112" fill="rgba(168,85,247,0.1)" stroke="#a855f7" strokeWidth="1.8" strokeOpacity=".5"/>
        <line x1="58" y1="192" x2="342" y2="192" stroke="#00d4ff" strokeWidth=".8" strokeDasharray="5,4" strokeOpacity=".4"/>
      </>}
      <rect x="174" y={floor2?248:200} width="52" height="65" rx="4" fill="rgba(0,212,255,0.07)" stroke="#00d4ff" strokeWidth="1" strokeOpacity=".4"/>
      <circle cx="186" cy={floor2?280:232} r="2.5" fill="#00d4ff" opacity=".6"/>
      {devices.length>0&&<circle cx={mx} cy={my} r="20" fill="url(#hGlow)" opacity={flash?1:.45}/>}
      <circle cx={mx} cy={my} r="13" fill="rgba(6,4,20,0.96)" stroke={flash?"#10b981":"#00d4ff"} strokeWidth="2" filter="url(#gf)"/>
      <text x={mx} y={my+5} textAnchor="middle" fontSize="12">📡</text>
      {devices.map((d: any,i: number)=>{
        const ang=(i/Math.max(devices.length,1))*Math.PI*2-Math.PI/2;
        const dx=mx+Math.cos(ang)*68,dy=my+Math.sin(ang)*68;
        const dev=DEVICES.find((x: any)=>x.id===d.id); const col=(dev as any)?.color||"#00d4ff";
        return(<g key={d.uid}>
          <line x1={mx} y1={my} x2={dx} y2={dy} stroke={col} strokeWidth="1.5" strokeOpacity=".65" strokeDasharray="4,3"><animate attributeName="stroke-dashoffset" from="0" to="14" dur="1.2s" repeatCount="indefinite"/></line>
          <circle cx={dx} cy={dy} r="12" fill="rgba(6,4,20,0.94)" stroke={col} strokeWidth="1.8" filter="url(#gf)"/>
          <text x={dx} y={dy+4.5} textAnchor="middle" fontSize="10">{(dev as any)?.emoji||"📱"}</text>
        </g>);
      })}
    </svg>
  );
};

const DEVICES = [
  {id:"tv",      name:"Smart TV",      emoji:"📺", mbps:25,  color:"#ec4899", desc:"Streaming 4K"},
  {id:"console", name:"Consola",       emoji:"🎮", mbps:50,  color:"#ef4444", desc:"Gaming Online"},
  {id:"laptop",  name:"Laptop",        emoji:"💻", mbps:25,  color:"#6366f1", desc:"Trabajo/Estudio"},
  {id:"phone",   name:"Smartphone",    emoji:"📱", mbps:10,  color:"#10b981", desc:"Conectividad"},
  {id:"tablet",  name:"Tablet",        emoji:"📲", mbps:15,  color:"#f59e0b", desc:"Entretenimiento"},
  {id:"pc",      name:"Gaming PC",     emoji:"🖥️", mbps:100, color:"#00e5ff", desc:"Alto rendimiento"},
  {id:"decoder", name:"Decodificador", emoji:"📡", mbps:15,  color:"#a855f7", desc:"TV por suscripción"},
  {id:"camera",  name:"Cámara IP",     emoji:"📷", mbps:5,   color:"#f97316", desc:"Seguridad hogar"},
];

const GameFlow = ({onBack}: any) => {
  const [lvl,setLvl]           = useState(0);
  const [avatar,setAvatar]     = useState<any>(null);
  const [devices,setDevices]   = useState<any[]>([]);
  const [mbps,setMbps]         = useState(0);
  const [floor2,setFloor2]     = useState(false);
  const [flash,setFlash]       = useState(false);
  const [planesDB,setPlanesDB] = useState<any[]>([]);
  const [necesidades,setNecesidades] = useState<any>(null);
  const [loading,setLoading]   = useState(false);

  const avatars=[
    {id:"gamer",       name:"Gamer",          emoji:"🎮", color:C.cyan,   desc:"Latencia ultra-baja", factorVelocidad:1.5, precioMax:200000},
    {id:"familia",     name:"Familia",         emoji:"👨‍👩‍👧‍👦", color:C.neon2,  desc:"Múltiples dispositivos", factorVelocidad:1.2, precioMax:300000},
    {id:"teletrabajo", name:"Teletrabajador",  emoji:"💼", color:C.green,  desc:"Estabilidad máxima", factorVelocidad:1.3, precioMax:250000},
    {id:"nomada",      name:"Nómada Digital",  emoji:"📱", color:C.yellow, desc:"Datos sin límite", factorVelocidad:1.0, precioMax:150000},
  ];

  const addDev = (id: string) => {
    const dev=DEVICES.find(d=>d.id===id); if(!dev)return;
    const uid=`${id}-${Math.random().toString(36).slice(2)}`;
    const nd=[...devices,{...dev,uid}];
    setDevices(nd); setMbps(p=>p+dev.mbps);
    if(nd.length>=4){setFlash(true);setTimeout(()=>setFlash(false),1600);}
  };
  const remDev = (uid: string) => {
    const d=devices.find(x=>x.uid===uid);
    if(d){setDevices(p=>p.filter(x=>x.uid!==uid));setMbps(p=>p-d.mbps);}
  };

  // ── MOTOR DE ANÁLISIS INTELIGENTE ──────────────────
  // ═══════════════════════════════════════════════════════════════════
// REEMPLAZA COMPLETAMENTE la función calcularRecomendacion en page.tsx
// Copia desde "const calcularRecomendacion" hasta el cierre "  };" inclusive
// ═══════════════════════════════════════════════════════════════════

  const calcularRecomendacion = async () => {
    setLoading(true);

    const necesitaTV     = devices.some(d => ["tv", "decoder"].includes(d.id));
    const necesitaGaming = devices.some(d => ["console", "pc"].includes(d.id));
    const necesitaMovil  = devices.some(d => d.id === "phone");
    const factor         = avatar?.factorVelocidad ?? 1.2;
    const mbpsNec        = Math.ceil(mbps * factor);
    const precioMax      = avatar?.precioMax ?? 300000;

    // Tipos relevantes según dispositivos conectados
    let tiposRelevantes: string[] = [];
    if (necesitaTV && mbpsNec > 0)        tiposRelevantes = ["paquete", "internet", "tv"];
    else if (necesitaTV)                  tiposRelevantes = ["paquete", "tv"];
    else if (necesitaMovil && mbps <= 20) tiposRelevantes = ["movil", "internet"];
    else                                  tiposRelevantes = ["internet", "paquete", "movil"];

    // Eco-sistema recomendado según dispositivos
    const eco: any[] = [];
    if (mbpsNec > 100) eco.push({ emoji: "📡", nombre: "Router WiFi 6 AX3000",   razon: "Necesitas mayor cobertura y velocidad", precio: 189900 });
    if (devices.length > 3) eco.push({ emoji: "📶", nombre: "Sistema Mesh Tenda", razon: "Elimina zonas sin señal en casa",       precio: 289900 });
    if (necesitaGaming) eco.push({ emoji: "🎮", nombre: "Cable Ethernet Cat8 10m", razon: "Latencia ultra-baja para gaming",       precio: 29900  });
    if (necesitaTV && !devices.find(d => d.id === "decoder"))
      eco.push({ emoji: "📺", nombre: "Decodificador 4K", razon: "Potencia tu experiencia TV", precio: 159900 });

    setNecesidades({
      mbpsNec, tipoRec: tiposRelevantes[0],
      necesitaTV, esGaming: necesitaGaming, tieneMovil: necesitaMovil,
      precioMax, eco
    });

    try {
      // ── 1. FETCH desde vista deduplicada en BD (277 planes únicos reales)
      const { data: rawData, error } = await supabase
        .from("planes_unicos")
        .select("id_crc, operador, nombre, tipo, precio, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia")
        .in("tipo", tiposRelevantes)
        .order("precio", { ascending: true })
        .limit(500);

      if (error) throw error;
      console.log(`✅ Planes únicos desde vista: ${rawData?.length}`);

      const rawPlanes = rawData ?? [];
      
      // ── 3. SCORING con penalizaciones duras primero
      const NOMBRES_INVALIDOS = [
        "ldi", "waze", "sms", "chat ilimitado", "redes sociales",
        "whatsapp", "minutos internacional", "internacional",
        "mensajes", "bolsa de minutos", "roaming", "llamadas internacionales",
      ];

      const scored = rawPlanes.map((p: any) => {
        const precio    = p.precio       ?? 0;
        const datos     = p.datos_gb     ?? 0;
        const canales   = p.canales_tv   ?? 0;
        const velocidad = p.velocidad_mbps ?? 0;
        const nombre    = (p.nombre      ?? "").toLowerCase();

        // — PENALIZACIONES DURAS: score -100 = excluido definitivamente —
        // Planes sin valor real: muy baratos o bolsas diarias
        if (precio > 0 && precio < 20000)                          return { ...p, _score: -100 };
        // Planes sin ningún contenido útil (no TV, no datos, no velocidad)
        if (!velocidad && !datos && p.tipo !== "tv")               return { ...p, _score: -100 };
        // Nombres que indican servicios que no son plan de conectividad
        if (NOMBRES_INVALIDOS.some(x => nombre.includes(x)))      return { ...p, _score: -100 };

        // — SCORING POSITIVO —
        let score = 0;

        // A) Precio dentro del presupuesto del avatar (0-40 pts)
        if (precio > 0 && precioMax > 0) {
          if      (precio <= precioMax)        score += 40;
          else if (precio <= precioMax * 1.15) score += 25;
          else if (precio <= precioMax * 1.3)  score += 10;
          // Si está muy por encima del presupuesto, penalizar levemente
          else score -= 10;
        }

        // B) Coincidencia de tipo (0-30 pts)
        if      (p.tipo === tiposRelevantes[0])          score += 30;
        else if (tiposRelevantes.includes(p.tipo))       score += 15;

        // C) Cobertura de necesidades reales del usuario (0-35 pts)
        if (necesitaTV) {
          if (canales > 50)                              score += 15; // TV real con canales
          else if (canales > 0 || p.tipo === "tv")       score += 8;
          else if (p.tipo === "paquete")                 score += 5;  // paquete sin canales explícitos = dudoso
        }
        if (necesitaMovil && (datos > 0 || datos === -1)) score += 10;
        if (necesitaGaming && velocidad >= 100)           score += 15;
        else if (necesitaGaming && velocidad >= 50)       score += 8;

        // D) Velocidad vs necesidad (0-20 pts)
        if (velocidad > 0 && mbpsNec > 0) {
          const ratio = velocidad / mbpsNec;
          if      (ratio >= 1.5) score += 20; // muy por encima: excelente
          else if (ratio >= 1.0) score += 15; // cumple justo
          else if (ratio >= 0.7) score += 8;  // casi llega
          else                   score += 2;  // insuficiente pero no lo excluimos
        }

        // E) Datos móviles (0-10 pts)
        if      (datos === -1)  score += 10; // ilimitado
        else if (datos >= 20)   score += 8;
        else if (datos >= 5)    score += 4;
        else if (datos > 0)     score += 2;

        // F) Bonus paquete cuando el usuario tiene muchos dispositivos
        if (devices.length >= 4 && p.tipo === "paquete") score += 8;

        return { ...p, _score: Math.round(score) };
      });

      // ── 4. FILTRAR (score > 0) y ORDENAR por score desc, luego precio asc como desempate
      const validos = scored
        .filter((p: any) => p._score > 0)
        .sort((a: any, b: any) =>
          b._score !== a._score
            ? b._score - a._score
            : (a.precio ?? 0) - (b.precio ?? 0)
        );

      // ── 5. SELECCIÓN FINAL: top 3 de operadores distintos
      //    Regla: el plan #1 es el mejor absoluto.
      //    Los planes #2 y #3 deben ser de operadores diferentes entre sí y al #1.
      //    Esto garantiza diversidad real en la recomendación.
      const resultado: any[] = [];
      const operadoresUsados = new Set<string>();

      for (const plan of validos) {
        if (resultado.length >= 3) break;
        const op = (plan.operador ?? "").toLowerCase().trim();
        if (!operadoresUsados.has(op)) {
          resultado.push(plan);
          operadoresUsados.add(op);
        }
      }

      // ── 6. ENRIQUECER con badges y colores para el UI
      const badges = ["🏆 Mejor Oferta", "⚡ Mejor Velocidad", "💰 Mejor Precio"];
      const glows  = ["#f59e0b",          "#00d4ff",            "#10b981"         ];

      setPlanesDB(
        resultado.map((p, i) => ({
          ...p,
          badge: badges[i] ?? `#${i + 1}`,
          glow:  glows[i]  ?? "#fff",
          top:   i === 0,
        }))
      );

    } catch (e) {
      console.error("Error consultando Supabase:", e);
      setPlanesDB([]);
    } finally {
      setLoading(false);
    }
  };

  const BG="linear-gradient(160deg,#04040f 0%,#080622 50%,#100830 100%)";
  const LvlBar=()=>(
    <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
      {[["🎯",1,"Perfil"],["🏠",2,"Casa"],["🏆",3,"Plan"]].map(([ic,n,l])=>(
        <div key={String(n)} style={{padding:"5px 15px",borderRadius:99,
          background:n===lvl?"linear-gradient(135deg,#0070cc,#0050aa)":n<lvl?"rgba(0,212,255,0.08)":"rgba(255,255,255,0.03)",
          border:n===lvl?"none":`1px solid ${n<lvl?C.border:C.borderSoft}`,
          color:n===lvl?"#fff":n<lvl?C.neon:"rgba(255,255,255,0.25)",
          fontWeight:700,fontSize:11.5,boxShadow:n===lvl?"0 0 16px rgba(0,212,255,0.25)":"none"
        }}>{ic} {l}</div>
      ))}
    </div>
  );
  const Wrap=({children}: any)=>(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"'Inter',system-ui,sans-serif",padding:"90px 20px 60px"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>{children}</div>
    </div>
  );

  if(lvl===0) return(
    <Wrap>
      <div style={{textAlign:"center",padding:"30px 0"}}>
        <div style={{fontSize:60,marginBottom:12}}>🏠</div>
        <Chip color={C.neon}>ANÁLISIS INTELIGENTE · 3 NIVELES</Chip>
        <h1 style={{fontSize:"clamp(1.6rem,5vw,2.4rem)",fontWeight:900,margin:"14px 0 10px",background:"linear-gradient(90deg,#00d4ff,#a855f7,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Diseñar mi Hogar Digital</h1>
        <p style={{color:C.muted,marginBottom:32,fontSize:14}}>Conecta tus dispositivos y nuestro motor IA encontrará el plan perfecto para ti</p>
        <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap",marginBottom:36}}>
          {[["🎯","Perfil","Tu avatar digital"],["🏠","Casa","Conecta devices"],["🤖","IA","Análisis inteligente"]].map(([ic,n,d])=>(
            <div key={n} style={{background:"rgba(0,212,255,0.05)",border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",textAlign:"center",minWidth:110}}>
              <div style={{fontSize:26,marginBottom:5}}>{ic}</div>
              <div style={{color:C.neon,fontWeight:700,fontSize:12}}>{n}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:2}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <GlowBtn onClick={()=>setLvl(1)} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{padding:"13px 36px",fontSize:15,borderRadius:12}}>▶ INICIAR ANÁLISIS</GlowBtn>
          <button onClick={onBack} style={{padding:"13px 24px",borderRadius:12,border:`1px solid ${C.borderSoft}`,background:"transparent",color:C.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>← Volver</button>
        </div>
      </div>
    </Wrap>
  );

  if(lvl===1) return(
    <Wrap>
      <LvlBar/>
      <h2 style={{textAlign:"center",fontWeight:900,fontSize:"clamp(1.2rem,4vw,1.7rem)",marginBottom:22,background:"linear-gradient(90deg,#00d4ff,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>¿Cuál es tu perfil digital?</h2>
      <p style={{textAlign:"center",color:C.muted,fontSize:12,marginBottom:18}}>Esto afina el análisis de velocidad y precio recomendado</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:22}}>
        {avatars.map(av=>{const sel=avatar?.id===av.id;return(
          <div key={av.id} onClick={()=>setAvatar(av)} style={{cursor:"pointer",textAlign:"center",padding:"20px 10px",background:sel?`${av.color}12`:"rgba(255,255,255,0.02)",border:`2px solid ${sel?av.color:C.borderSoft}`,borderRadius:14,boxShadow:sel?`0 0 24px ${av.color}28`:"none",transition:"all .2s"}}>
            <div style={{fontSize:36,marginBottom:7}}>{av.emoji}</div>
            <div style={{color:av.color,fontWeight:800,fontSize:13,marginBottom:3}}>{av.name}</div>
            <div style={{color:C.muted,fontSize:11,marginBottom:4}}>{av.desc}</div>
            <div style={{color:"rgba(255,255,255,0.25)",fontSize:9}}>Presupuesto: ${av.precioMax.toLocaleString()}/mes</div>
            {sel&&<div style={{marginTop:7,color:av.color,fontSize:10,fontWeight:800}}>✓ Seleccionado</div>}
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onBack} style={{padding:"9px 18px",borderRadius:10,border:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.03)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12}}>← Volver</button>
        <GlowBtn onClick={()=>avatar&&setLvl(2)} disabled={!avatar} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{marginLeft:"auto",borderRadius:10,padding:"9px 22px"}}>Siguiente → Diseñar Casa</GlowBtn>
      </div>
    </Wrap>
  );

  if(lvl===2) return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:"100vh"}}>
        <div style={{padding:"90px 16px 24px",display:"flex",flexDirection:"column",borderRight:`1px solid ${C.borderSoft}`}}>
          <LvlBar/>
          <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:14}}>
            {[["🏠 1 Planta",false,C.neon],["🏢 2 Plantas",true,C.neon2]].map(([l,v,col]: any)=>(
              <button key={String(l)} onClick={()=>setFloor2(v)} style={{padding:"6px 14px",borderRadius:99,border:`2px solid ${floor2===v?col:C.borderSoft}`,background:floor2===v?`${col}14`:"transparent",color:floor2===v?col:C.muted,fontWeight:700,fontSize:11.5,cursor:"pointer",transition:"all .18s"}}>{l}</button>
            ))}
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <HouseSVG floor2={floor2} devices={devices} flash={flash}/>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.borderSoft}`,borderRadius:11,padding:"10px 13px",marginTop:10}}>
            <div style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:1,marginBottom:5,textAlign:"center"}}>⚡ CARGA DE RED ESTIMADA</div>
            <div style={{background:"rgba(255,255,255,0.05)",borderRadius:99,height:8,overflow:"hidden",marginBottom:4}}>
              <div style={{height:"100%",borderRadius:99,width:`${Math.min((mbps/400)*100,100)}%`,background:`linear-gradient(90deg,${mbps<100?"#10b981":mbps<250?"#f59e0b":"#ef4444"},#00d4ff)`,transition:"width .5s"}}/>
            </div>
            <div style={{textAlign:"center"}}>
              <span style={{color:C.neon,fontWeight:900,fontSize:16}}>{mbps}</span>
              <span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}> Mbps base · recomendado: </span>
              <span style={{color:C.yellow,fontWeight:800,fontSize:13}}>{Math.ceil(mbps*(avatar?.factorVelocidad||1.2))} Mbps</span>
            </div>
          </div>
          {devices.length>0&&(
            <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:5}}>
              {devices.map((d: any)=>(
                <div key={d.uid} onClick={()=>remDev(d.uid)} title="Quitar" style={{cursor:"pointer",background:`${d.color}14`,border:`1px solid ${d.color}33`,borderRadius:7,padding:"3px 8px",display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:12}}>{d.emoji}</span>
                  <span style={{color:"#fff",fontSize:10,fontWeight:700}}>{d.name}</span>
                  <span style={{color:C.red,fontSize:11,fontWeight:900,marginLeft:2}}>×</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{padding:"90px 16px 24px",overflowY:"auto"}}>
          <h3 style={{fontWeight:900,fontSize:14,marginBottom:4,textAlign:"center",color:"#fff"}}>Agregar Dispositivos</h3>
          <p style={{color:C.muted,fontSize:11,textAlign:"center",marginBottom:14}}>El motor IA calculará el plan ideal según tu combinación</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
            {DEVICES.map(d=>{const cnt=devices.filter((x: any)=>x.id===d.id).length;return(
              <div key={d.id} onClick={()=>addDev(d.id)} style={{cursor:"pointer",textAlign:"center",padding:"13px 8px",background:cnt>0?`${d.color}0e`:"rgba(255,255,255,0.02)",border:`2px solid ${cnt>0?d.color:C.borderSoft}`,borderRadius:11,boxShadow:cnt>0?`0 0 16px ${d.color}28`:"none",transition:"all .2s",position:"relative"}}
                onMouseEnter={(e:any)=>{if(!cnt){e.currentTarget.style.border=`2px solid ${d.color}66`;e.currentTarget.style.background=`${d.color}07`;}}}
                onMouseLeave={(e:any)=>{if(!cnt){e.currentTarget.style.border=`2px solid ${C.borderSoft}`;e.currentTarget.style.background="rgba(255,255,255,0.02)";}}}
              >
                {cnt>0&&<div style={{position:"absolute",top:6,right:6,background:d.color,color:"#000",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900}}>{cnt}</div>}
                <div style={{fontSize:24,marginBottom:4}}>{d.emoji}</div>
                <div style={{color:"#fff",fontWeight:700,fontSize:11,marginBottom:2}}>{d.name}</div>
                <div style={{color:d.color,fontSize:10,fontWeight:700}}>+{d.mbps} Mbps</div>
                <div style={{color:C.muted,fontSize:9,marginTop:2}}>{d.desc}</div>
              </div>
            );})}
          </div>
          <GlowBtn full onClick={()=>{if(devices.length>0){calcularRecomendacion();setLvl(3);}}} disabled={devices.length===0} gradient="linear-gradient(135deg,#a855f7,#ec4899)" glow={C.neon2} style={{borderRadius:12,padding:"12px 0"}}>
            🤖 Analizar y Ver Plan Ideal →
          </GlowBtn>
          <button onClick={()=>setLvl(1)} style={{width:"100%",marginTop:8,padding:"8px 0",borderRadius:10,border:`1px solid ${C.borderSoft}`,background:"transparent",color:C.muted,fontSize:12,fontWeight:700,cursor:"pointer"}}>← Cambiar perfil</button>
        </div>
      </div>
    </div>
  );

  if(lvl===3) return(
    <Wrap>
      <LvlBar/>
      {loading?(
        <div style={{textAlign:"center",padding:"60px 0"}}>
          <div style={{fontSize:48,marginBottom:14}}>🤖</div>
          <div style={{fontWeight:900,fontSize:18,background:"linear-gradient(90deg,#00d4ff,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>Analizando tu hogar...</div>
          <div style={{color:C.muted,fontSize:12,marginBottom:16}}>Consultando {necesidades?.tipoRec||"planes"} · Calculando velocidad óptima</div>
          <div style={{display:"flex",gap:5,justifyContent:"center"}}>{[0,1,2,3].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.neon,animation:`blink 1.2s ${i*.2}s infinite`}}/>)}</div>
        </div>
      ):(
        <>
          {necesidades&&(
            <div style={{background:"rgba(0,212,255,0.05)",border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 18px",marginBottom:20}}>
              <div style={{color:C.neon,fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:10}}>🤖 ANÁLISIS COMPLETADO</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[
                  ["⚡","Velocidad recomendada",`${necesidades.mbpsNec} Mbps`],
                  ["📦","Tipo de plan",necesidades.tipoRec.toUpperCase()],
                  ["💰","Presupuesto máx",`$${necesidades.precioMax.toLocaleString()}`],
                ].map(([ic,l,v])=>(
                  <div key={String(l)} style={{textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"8px 6px"}}>
                    <div style={{fontSize:18,marginBottom:3}}>{ic}</div>
                    <div style={{color:C.muted,fontSize:9,marginBottom:2}}>{l}</div>
                    <div style={{color:"#fff",fontWeight:800,fontSize:12}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:7,marginTop:10,flexWrap:"wrap"}}>
                {necesidades.necesitaTV&&<Chip color={C.neon2}>📺 Necesita TV</Chip>}
                {necesidades.esGaming&&<Chip color={C.red}>🎮 Gaming</Chip>}
                {necesidades.tieneMovil&&<Chip color={C.green}>📱 Móvil</Chip>}
                <Chip color={C.yellow}>{avatar?.emoji} {avatar?.name}</Chip>
                <Chip color={C.cyan}>{devices.length} dispositivos</Chip>
              </div>
            </div>
          )}
          <h2 style={{textAlign:"center",fontWeight:900,fontSize:"clamp(1.1rem,4vw,1.5rem)",marginBottom:16,color:"#fff"}}>🏆 Top 3 Planes Recomendados</h2>
          {planesDB.length===0?(
            <div style={{textAlign:"center",padding:"30px 0",color:C.muted}}>
              <div style={{fontSize:36,marginBottom:10}}>🔍</div>
              <div style={{fontSize:13,marginBottom:14}}>No encontramos planes con esos filtros exactos.</div>
              <WABtn name="plan personalizado" label="Pedir asesoría personalizada" style={{borderRadius:10,margin:"0 auto"}}/>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
              {planesDB.map((p: any,i: number)=>(
                <div key={p.id||i} style={{border:`2px solid ${p.top?p.glow:"rgba(255,255,255,0.07)"}`,borderRadius:15,padding:18,background:p.top?`${p.glow}0c`:"rgba(255,255,255,0.02)",boxShadow:p.top?`0 0 28px ${p.glow}22`:"none",position:"relative"}}>
                  {p.top&&<div style={{position:"absolute",top:0,right:0,background:`linear-gradient(135deg,${p.glow},#a855f7)`,color:"#fff",fontSize:9,fontWeight:900,padding:"3px 10px",borderBottomLeftRadius:9}}>🏆 MEJOR MATCH</div>}
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:6}}>
                    <div>
                      <Chip color={p.glow}>{p.operador}</Chip>
                      <div style={{fontWeight:900,fontSize:14,marginTop:6,color:"#fff",lineHeight:1.3}}>{p.nombre}</div>
                      <div style={{color:p.glow,fontSize:11,fontWeight:700,marginTop:2}}>{p.badge}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:900,fontSize:24,color:"#fff"}}>${(p.precio||0).toLocaleString()}<span style={{fontSize:9,opacity:.35}}>/mes</span></div>
                      {p.velocidad_mbps&&<div style={{color:C.muted,fontSize:11}}>⚡ {p.velocidad_mbps} Mbps</div>}
                      <div style={{color:p.glow,fontSize:10,fontWeight:700,marginTop:2}}>Score: {p._score}/100</div>
                    </div>
                  </div>
                  {[
                    ["Velocidad", necesidades?.mbpsNec>0?Math.min(100,Math.round((p.velocidad_mbps||0)/Math.max(necesidades.mbpsNec,1)*100)):50, C.neon],
                    ["Precio",    Math.max(10,Math.round((1-(p.precio||0)/Math.max(necesidades?.precioMax,1))*100)), C.green],
                    ["Match",     Math.min(p._score,100), p.glow],
                  ].map(([l,v,col]: any)=>(
                    <div key={l} style={{marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:2}}><span>{l}</span><span style={{color:col,fontWeight:700}}>{v}%</span></div>
                      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:99,height:5}}><div style={{width:`${v}%`,height:"100%",borderRadius:99,background:col,transition:"width 1s"}}/></div>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    {p.modalidad&&<Chip color={C.muted}>{p.modalidad}</Chip>}
                    {p.tipo&&<Chip color={C.border}>{p.tipo}</Chip>}
                    {p.datos_gb&&<Chip color={C.neon2}>{p.datos_gb===-1?"∞ GB":`${p.datos_gb} GB`}</Chip>}
                    {p.canales_tv&&<Chip color={C.pink}>{p.canales_tv} canales</Chip>}
                  </div>
                  <div style={{marginTop:11}}>
                    <WABtn name={`${p.operador} — ${p.nombre}`} label="Lo Quiero — WhatsApp" full style={{borderRadius:10}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
          {necesidades?.eco?.length>0&&(
            <div style={{background:"rgba(168,85,247,0.06)",border:`1px solid rgba(168,85,247,0.2)`,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
              <div style={{color:C.neon2,fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:10}}>🛒 ECOSISTEMA RECOMENDADO PARA TI</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {necesidades.eco.map((r: any,i: number)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"9px 11px"}}>
                    <span style={{fontSize:22,flexShrink:0}}>{r.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{color:"#fff",fontWeight:700,fontSize:12}}>{r.nombre}</div>
                      <div style={{color:C.muted,fontSize:10,marginTop:1}}>{r.razon}</div>
                    </div>
                    <div style={{flexShrink:0}}>
                      {r.precio===0?<Chip color={C.green}>GRATIS</Chip>:<div style={{color:C.neon,fontWeight:800,fontSize:12}}>${r.precio.toLocaleString()}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <WABtn name="ecosistema tech recomendado" label="Ver equipos disponibles" full style={{marginTop:11,borderRadius:9}}/>
            </div>
          )}
          <button onClick={()=>setLvl(2)} style={{width:"100%",padding:10,borderRadius:11,border:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.03)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12}}>← Cambiar dispositivos</button>
        </>
      )}
    </Wrap>
  );

  // Fallback (nunca debería llegar aquí)
  return <Wrap><div/></Wrap>;
};

/* ═══ QUIZ FLOW ═══ */
const QuizFlow = ({onBack}: any) => {
  const [cur,setCur]=useState(0); const [ans,setAns]=useState<any>({}); const [done,setDone]=useState(false); const [loading,setLoading]=useState(false);
  const cities=["Bogotá D.C.","Medellín","Cali","Barranquilla","Cartagena","Pereira","Santa Marta"];
  const getLoc=()=>{const m: any={["Bogotá D.C."]:["Usaquén","Chapinero","Kennedy","Suba","Bosa"],Medellín:["El Poblado","Laureles","Belén"],Cali:["Norte","Sur","Centro"]};return m[ans.city]||["Centro","Norte","Sur"];};
  const questions=[{id:"tipoCliente",q:"¿Cómo te identificas?",type:"tipo"},{id:"city",q:"¿En qué ciudad estás?",type:"select",opts:cities},{id:"address",q:"¿Cuál es tu dirección?",type:"address"},{id:"servicios",q:"¿Qué servicios necesitas?",type:"services"}];
  const srvOpts=[{id:"internet",label:"Internet",icon:Wifi,glow:C.neon},{id:"movil",label:"Móvil",icon:Smartphone,glow:C.neon2},{id:"tv",label:"TV",icon:Tv,glow:C.pink}];
  const setA=(id: string,val: any)=>{
    if(id==="address")setAns((p: any)=>({...p,address:{...p.address,...val}}));
    else if(id==="servicios"){const c=ans.servicios||[];setAns((p: any)=>({...p,servicios:c.includes(val)?c.filter((v: any)=>v!==val):[...c,val]}));}
    else setAns((p: any)=>({...p,[id]:val}));
  };
  const canGo=()=>{const q=questions[cur];if(q.type==="address"){const a=ans.address||{};return a.streetType&&a.streetNumber&&a.localidad&&a.estrato;}if(q.type==="services")return ans.servicios?.length>0;return!!ans[q.id];};
  const next=()=>{if(cur<questions.length-1)setCur(c=>c+1);else{setLoading(true);setTimeout(()=>setDone(true),2000);}};

  if(loading&&!done) return(
    <div style={{textAlign:"center",padding:"80px 0"}}>
      <div style={{fontSize:48,marginBottom:14}}>⚡</div>
      <div style={{fontWeight:900,fontSize:18,background:"linear-gradient(90deg,#00d4ff,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>Analizando cobertura...</div>
      <div style={{display:"flex",gap:5,justifyContent:"center"}}>{[0,1,2,3].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.neon,animation:`blink 1.2s ${i*.2}s infinite`}}/>)}</div>
    </div>
  );

  if(done) return(
    <div>
      <div style={{textAlign:"center",marginBottom:24}}><Chip color={C.green}>✓ RESULTADOS PARA TI</Chip><h2 style={{fontSize:"clamp(1.3rem,4vw,1.8rem)",fontWeight:900,marginTop:10,color:"#fff"}}>Planes en tu zona</h2></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14,marginBottom:20}}>
        {[{op:"Claro",name:"Fibra 200 Mbps",price:89900,speed:200,benefits:["HBO Max 3m","WiFi 6"],glow:"#e2001a"},{op:"Movistar",name:"Móvil 20GB Pro",price:45900,benefits:["20GB Datos","Roaming LatAm"],glow:"#00aa44"},{op:"Tigo",name:"Internet+TV 300",price:125900,speed:300,benefits:["140 Canales HD","IP Fija"],glow:"#00a0e3"}].map((p,i)=>(
          <Card key={i} glow={p.glow} style={{padding:18}}>
            <div style={{color:p.glow,fontWeight:800,fontSize:12,marginBottom:4}}>{p.op}</div>
            <div style={{fontWeight:800,fontSize:14,marginBottom:8,color:"#fff"}}>{p.name}</div>
            <div style={{fontWeight:900,fontSize:24,color:p.glow,marginBottom:9}}>${p.price.toLocaleString()}<span style={{fontSize:9,color:C.muted,fontWeight:600}}>/mes</span></div>
            {p.benefits.map(b=><div key={b} style={{display:"flex",gap:6,marginBottom:3}}><Check size={10} color={p.glow}/><span style={{color:C.muted,fontSize:11}}>{b}</span></div>)}
            <WABtn name={`${p.op} ${p.name}`} full style={{marginTop:11,borderRadius:9}}/>
          </Card>
        ))}
      </div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,borderRadius:10,padding:"9px 22px",color:C.neon,fontWeight:700,fontSize:12,cursor:"pointer"}}>← Volver</button>
    </div>
  );

  const q=questions[cur];
  return(
    <div>
      <div style={{background:"rgba(0,212,255,0.06)",borderRadius:99,height:4,marginBottom:18}}>
        <div style={{height:"100%",borderRadius:99,background:"linear-gradient(90deg,#00d4ff,#a855f7)",width:`${((cur+1)/questions.length)*100}%`,transition:"width .4s"}}/>
      </div>
      <Chip color={C.neon}>{cur+1} / {questions.length}</Chip>
      <h2 style={{fontSize:"clamp(1.2rem,3.5vw,1.6rem)",fontWeight:900,margin:"12px 0 18px",color:"#fff"}}>{q.q}</h2>
      <Card glow={C.neon} style={{padding:18,marginBottom:14}}>
        {q.type==="tipo"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{value:"natural",Icon:User,label:"Persona Natural"},{value:"pyme",Icon:Building,label:"Empresa / Pyme"}].map(({value,Icon,label})=>(
            <div key={value} onClick={()=>setA("tipoCliente",value)} style={{cursor:"pointer",padding:"18px 10px",textAlign:"center",borderRadius:11,border:`2px solid ${ans.tipoCliente===value?C.neon:C.borderSoft}`,background:ans.tipoCliente===value?"rgba(0,212,255,0.07)":"rgba(255,255,255,0.02)",transition:"all .2s"}}>
              <Icon size={28} color={C.neon} style={{margin:"0 auto 8px"}}/><span style={{fontWeight:700,fontSize:13,color:"#fff"}}>{label}</span>
            </div>
          ))}
        </div>}
        {q.type==="select"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
          {(q as any).opts.map((opt: string,i: number)=>(
            <div key={i} onClick={()=>setA(q.id,opt)} style={{cursor:"pointer",padding:"10px 13px",borderRadius:9,border:`2px solid ${ans[q.id]===opt?C.neon:C.borderSoft}`,background:ans[q.id]===opt?"rgba(0,212,255,0.07)":"rgba(255,255,255,0.02)",fontWeight:600,fontSize:12,color:"#fff",transition:"all .16s"}}>{opt}</div>
          ))}
        </div>}
        {q.type==="address"&&<div style={{display:"flex",flexDirection:"column",gap:9}}>
          {[{k:"streetType",label:"Tipo de vía",type:"select",opts:["Calle","Carrera","Avenida"]},{k:"streetNumber",label:"Número",type:"input"},{k:"localidad",label:"Localidad/Barrio",type:"select",opts:getLoc()},{k:"estrato",label:"Estrato",type:"select",opts:[1,2,3,4,5,6]}].map(f=>(
            <div key={f.k}>
              <label style={{display:"block",color:C.muted,fontSize:11,fontWeight:700,marginBottom:3}}>{f.label}</label>
              {f.type==="select"?(
                <select value={ans.address?.[f.k]||""} onChange={e=>setA("address",{[f.k]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,borderRadius:9,padding:"9px 12px",color:ans.address?.[f.k]?"#fff":"rgba(180,190,220,0.3)",fontSize:12,outline:"none"}}>
                  <option value="">Selecciona</option>
                  {f.opts.map((o: any)=><option key={o} value={o} style={{background:"#080620"}}>{f.k==="estrato"?`Estrato ${o}`:o}</option>)}
                </select>
              ):(
                <input type="text" placeholder={f.label} value={ans.address?.[f.k]||""} onChange={e=>setA("address",{[f.k]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.borderSoft}`,borderRadius:9,padding:"9px 12px",color:"#fff",fontSize:12,outline:"none"}}/>
              )}
            </div>
          ))}
        </div>}
        {q.type==="services"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
          {srvOpts.map(opt=>{const sel=(ans.servicios||[]).includes(opt.id);return(
            <div key={opt.id} onClick={()=>setA("servicios",opt.id)} style={{cursor:"pointer",textAlign:"center",padding:"16px 8px",borderRadius:11,border:`2px solid ${sel?opt.glow:C.borderSoft}`,background:sel?`${opt.glow}0e`:"rgba(255,255,255,0.02)",boxShadow:sel?`0 0 14px ${opt.glow}22`:"none",transition:"all .2s"}}>
              <opt.icon size={24} color={opt.glow} style={{margin:"0 auto 7px"}}/><span style={{fontWeight:700,fontSize:12,color:"#fff"}}>{opt.label}</span>
            </div>
          );})}
        </div>}
      </Card>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>{if(cur===0)onBack();else setCur(c=>c-1);}} style={{padding:"9px 18px",borderRadius:9,border:`1px solid ${C.borderSoft}`,background:"rgba(255,255,255,0.03)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12}}>← {cur===0?"Inicio":"Anterior"}</button>
        <GlowBtn onClick={next} disabled={!canGo()} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{marginLeft:"auto",borderRadius:9,padding:"9px 22px"}}>
          {cur===questions.length-1?"Ver Planes ✓":"Siguiente →"}
        </GlowBtn>
      </div>
    </div>
  );
};

/* ═══ VIDEO CAROUSEL ═══ */
const VIDEOS = [
  { src: "https://res.cloudinary.com/dp5buhuez/video/upload/Video_2_Multidispositivo_k5b14q.mp4", title: "Multi-dispositivo", desc: "Conecta toda tu familia" },
  { src: "https://res.cloudinary.com/dp5buhuez/video/upload/Video3_El_Gamer_zdlpyw.mp4", title: "El Gamer", desc: "Latencia ultra-baja" },
  { src: "https://res.cloudinary.com/dp5buhuez/video/upload/Video_4_El_Teletrabajador_hllnzu.mp4", title: "Teletrabajador", desc: "Estabilidad máxima" },
  { src: "https://res.cloudinary.com/dp5buhuez/video/upload/Video_5_El_Nomada_fovhh3.mp4", title: "Nómada Digital", desc: "Datos sin límite" },
];

const VideoCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<any[]>([]);
  const timerRef = useRef<any>(null);

  const goTo = (idx: number) => {
    const prev = videoRefs.current[current];
    if (prev) { prev.pause(); prev.currentTime = 0; }
    setCurrent(idx);
  };

  useEffect(() => {
    const vid = videoRefs.current[current];
    if (!vid) return;
    vid.muted = muted;
    vid.currentTime = 0;
    if (isPlaying) vid.play().catch(() => {});
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { goTo((current + 1) % VIDEOS.length); }, 6200);
    return () => clearTimeout(timerRef.current);
  }, [current, isPlaying]);

  useEffect(() => { videoRefs.current.forEach((v) => { if (v) v.muted = muted; }); }, [muted]);

  const togglePlay = () => {
    const vid = videoRefs.current[current];
    if (!vid) return;
    if (isPlaying) { vid.pause(); setIsPlaying(false); }
    else { vid.play().catch(() => {}); setIsPlaying(true); }
  };

  return (
    <div style={{position:"relative",width:"100%",borderRadius:18,overflow:"hidden",border:`1px solid rgba(0,212,255,0.2)`,boxShadow:"0 0 60px rgba(0,212,255,0.1), 0 24px 80px rgba(0,0,0,0.6)",background:"#04040f",aspectRatio:"16/9"}}>
      {VIDEOS.map((v, i) => (
        <video key={i} ref={(el: any) => videoRefs.current[i] = el} src={v.src} muted={muted} playsInline loop={false} preload="auto"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:i===current?1:0,transition:"opacity 0.6s ease",zIndex:i===current?1:0}}/>
      ))}
      <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",background:"linear-gradient(to top, rgba(4,4,15,0.85) 0%, rgba(4,4,15,0.2) 40%, transparent 70%)"}}/>
      <div style={{position:"absolute",top:12,right:12,zIndex:10,display:"flex",gap:7,alignItems:"center"}}>
        <button onClick={togglePlay} style={{width:32,height:32,borderRadius:"50%",background:"rgba(4,4,15,0.7)",border:"1px solid rgba(0,212,255,0.3)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",fontSize:12,transition:"all .2s"}}>{isPlaying?"⏸":"▶"}</button>
        <button onClick={()=>setMuted(m=>!m)} style={{width:32,height:32,borderRadius:"50%",background:muted?"rgba(4,4,15,0.7)":"rgba(0,212,255,0.25)",border:`1px solid ${muted?"rgba(255,255,255,0.15)":"rgba(0,212,255,0.5)"}`,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",fontSize:14,transition:"all .2s"}}>{muted?"🔇":"🔊"}</button>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,padding:"12px 16px",display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#fff",fontWeight:800,fontSize:13,textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>{VIDEOS[current].title}</div>
          <div style={{color:"rgba(0,212,255,0.8)",fontSize:10,fontWeight:600,marginTop:2}}>{VIDEOS[current].desc}</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {VIDEOS.map((_,i)=>(<button key={i} onClick={()=>goTo(i)} style={{width:i===current?20:6,height:6,borderRadius:99,border:"none",cursor:"pointer",background:i===current?"#00d4ff":"rgba(255,255,255,0.3)",transition:"all .3s",padding:0}}/>))}
        </div>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:11,height:2,background:"rgba(255,255,255,0.1)"}}>
        <div key={current} style={{height:"100%",background:"linear-gradient(90deg,#00d4ff,#a855f7)",borderRadius:99,animation:isPlaying?"videoProgress 6.2s linear forwards":"none"}}/>
      </div>
    </div>
  );
};

const QuickCards = () => (
  <div style={{display:"flex",flexDirection:"column",gap:9}}>
    {[
      {ic:"🛡️",label:"Conexión Social",desc:"Internet gratis estrato 1-2",color:C.green,wa:"Conexión Social ETB"},
      {ic:"🎁",label:"Refiere & Gana",desc:"Premios · Cashback · Sodexo",color:C.neon2,wa:"programa de referidos"},
      {ic:"🎧",label:"Portal Asesores",desc:"CRM · Comisiones · Training",color:C.yellow,wa:"registro como asesor"},
    ].map((c,i)=>(
      <div key={i} style={{background:`${c.color}08`,border:`1px solid ${c.color}28`,borderRadius:12,padding:"11px 13px",cursor:"pointer",transition:"all .18s"}}
        onMouseEnter={(e:any)=>{e.currentTarget.style.background=`${c.color}14`;e.currentTarget.style.borderColor=`${c.color}44`;e.currentTarget.style.transform="translateX(3px)";}}
        onMouseLeave={(e:any)=>{e.currentTarget.style.background=`${c.color}08`;e.currentTarget.style.borderColor=`${c.color}28`;e.currentTarget.style.transform="";}}
        onClick={()=>openWA(c.wa)}
      >
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
          <span style={{fontSize:16}}>{c.ic}</span>
          <span style={{color:"#fff",fontWeight:700,fontSize:12}}>{c.label}</span>
          <ChevronRight size={11} color={c.color} style={{marginLeft:"auto"}}/>
        </div>
        <div style={{color:C.muted,fontSize:10,marginBottom:6,paddingLeft:23}}>{c.desc}</div>
        <button onClick={(e:any)=>{e.stopPropagation();openWA(c.wa);}} style={{marginLeft:23,background:`${c.color}14`,border:`1px solid ${c.color}33`,borderRadius:99,padding:"3px 11px",color:c.color,fontSize:9.5,fontWeight:800,cursor:"pointer"}}>→ Acceder</button>
      </div>
    ))}
  </div>
);

/* ═══ MAIN APP ═══ */
export default function App() {
  const [view,setView]=useState("landing");
  const [searchOpen,setSearchOpen]=useState(false);
  const [authMode,setAuthMode]=useState<string|null>(null);
  const [habea,setHabea]=useState(false);
  const [mayor,setMayor]=useState(false);
  const [cart,setCart]=useState<any[]>([]);
  const [cartOpen,setCartOpen]=useState(false);

  const addToCart = (item: any) => {
    setCart(p=>{const idx=p.findIndex((x: any)=>x.id===item.id);if(idx!==-1){const n=[...p];n[idx]={...n[idx],qty:n[idx].qty+1};return n;}return[...p,{...item,qty:1}];});
    setCartOpen(true);
  };

  useEffect(()=>{
    const fn=(e: any)=>{if(e.key==="Escape"){setSearchOpen(false);setAuthMode(null);}if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setSearchOpen(true);}};
    window.addEventListener("keydown",fn);
    const navFn=(e: any)=>{if(e.detail==="game")setView("game");};
    document.addEventListener("navAction",navFn);
    return()=>{window.removeEventListener("keydown",fn);document.removeEventListener("navAction",navFn);};
  },[]);

  const cartCount=cart.reduce((s: number,i: any)=>s+i.qty,0);
  const HEADER_H=95;

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'Inter',system-ui,sans-serif",overflowX:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;background:#04040f}::-webkit-scrollbar-thumb{background:#00d4ff33;border-radius:99px}
        @keyframes megaIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes slideLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes videoProgress{from{width:0%}to{width:100%}}
        input::placeholder{color:rgba(180,190,220,0.3)}
        input,select,button{font-family:'Inter',system-ui,sans-serif}
        select option{background:#080620;color:#fff}
      `}</style>

      <Header onSearch={()=>setSearchOpen(true)} onLogin={()=>setAuthMode("login")} onRegister={()=>setAuthMode("register")} cartCount={cartCount} onCart={()=>setCartOpen(true)}/>
      <Chatbot/>
      <SearchBar open={searchOpen} onClose={()=>setSearchOpen(false)}/>
      {authMode&&<AuthModal mode={authMode} onClose={()=>setAuthMode(null)}/>}
      <CartDrawer cart={cart} setCart={setCart} open={cartOpen} onClose={()=>setCartOpen(false)}/>

      <div style={{height:HEADER_H}}/>
      <OpsSlider/>

      {view==="game"&&<GameFlow onBack={()=>setView("landing")}/>}
      {view==="quiz"&&(
        <div style={{maxWidth:600,margin:"0 auto",padding:"32px 20px 60px",animation:"fadeUp .45s ease-out"}}>
          <QuizFlow onBack={()=>setView("landing")}/>
        </div>
      )}
      {view==="landing"&&(
        <div style={{maxWidth:1380,margin:"0 auto",padding:"26px 20px 60px",animation:"fadeUp .45s ease-out"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 310px",gap:24,alignItems:"start"}}>
            <div style={{display:"flex",flexDirection:"column",gap:28}}>

              {/* HERO */}
              <section style={{position:"relative",borderRadius:20,overflow:"hidden",border:`1px solid ${C.border}`,background:"rgba(6,4,22,0.7)",padding:"48px 32px 40px",minHeight:330}}>
                <Particles count={30}/>
                <div style={{marginBottom:20}}><VideoCarousel/></div>
                <div style={{position:"relative",zIndex:2}}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(0,212,255,0.08)",border:`1px solid ${C.border}`,borderRadius:99,padding:"5px 14px",marginBottom:16}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:C.green,display:"inline-block",animation:"blink 1.5s infinite"}}/>
                    <span style={{color:C.neon,fontSize:11,fontWeight:700}}>+1.500 usuarios ahorran cada mes</span>
                  </div>
                  <h1 style={{fontSize:"clamp(1.7rem,4vw,2.7rem)",fontWeight:900,lineHeight:1.1,marginBottom:12,color:"#fff",letterSpacing:-1}}>
                    Compara y desbloquea el<br/>
                    <span style={{background:"linear-gradient(90deg,#00d4ff,#a855f7,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>máximo potencial de tu red</span>
                  </h1>
                  <p style={{fontSize:14,color:"rgba(180,195,230,0.75)",marginBottom:22,maxWidth:460,lineHeight:1.65}}>Ahorra hasta un <strong style={{color:"#fff"}}>40% en tu factura</strong>. Análisis inteligente de planes en segundos.</p>
                  <div style={{background:"rgba(0,212,255,0.04)",border:`1px solid ${C.border}`,borderRadius:11,padding:"12px 15px",marginBottom:20,maxWidth:400}}>
                    <div style={{color:"rgba(0,212,255,0.3)",fontSize:9,fontWeight:800,letterSpacing:1,marginBottom:9}}>AUTORIZACIÓN DE DATOS</div>
                    {([[mayor,setMayor,"Soy mayor de edad (18+)"],[habea,setHabea,"Acepto Política de Tratamiento de Datos"]] as any[]).map(([val,set,label],i)=>(
                      <label key={i} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",marginBottom:i===0?7:0}}>
                        <div onClick={()=>set(!val)} style={{width:15,height:15,borderRadius:4,border:`2px solid ${val?C.neon:"rgba(255,255,255,0.15)"}`,background:val?C.neon:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>{val&&<Check size={8} color="#04040f" strokeWidth={3}/>}</div>
                        <span style={{color:"rgba(180,190,220,0.65)",fontSize:11,fontWeight:600}}>{label}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-start"}}>
                    <div>
                      <GlowBtn onClick={()=>setView("quiz")} disabled={!habea||!mayor} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{borderRadius:11,padding:"11px 24px",fontSize:14}}>
                        <span style={{display:"flex",alignItems:"center",gap:7}}><Search size={14}/>Comparar Planes<ArrowRight size={12}/></span>
                      </GlowBtn>
                      <div style={{marginTop:5,color:C.green,fontSize:10,fontWeight:700,textAlign:"center"}}>⚡ Escaneo Rápido</div>
                    </div>
                    <div>
                      <GlowBtn onClick={()=>setView("game")} disabled={!habea||!mayor} gradient="linear-gradient(135deg,#6600cc,#a855f7)" glow={C.neon2} style={{borderRadius:11,padding:"11px 22px",fontSize:14}}>
                        <span style={{display:"flex",alignItems:"center",gap:7}}><Zap size={14}/>Diseñar Hogar Digital</span>
                      </GlowBtn>
                      <div style={{marginTop:5,color:C.neon2,fontSize:10,fontWeight:700,textAlign:"center"}}>🏠 Misión 3D</div>
                    </div>
                    <WABtn name="asesoría personalizada" label="Asesor WhatsApp" style={{borderRadius:11,padding:"11px 18px",fontSize:14}}/>
                  </div>
                </div>
              </section>

              {/* PLANES DESTACADOS */}
              <section>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div><Chip color={C.neon2}>PLANES DESTACADOS</Chip><h2 style={{fontWeight:900,fontSize:"clamp(1.1rem,3vw,1.5rem)",marginTop:8,color:"#fff"}}>Los mejores del mercado</h2></div>
                  <GlowBtn onClick={()=>setView("quiz")} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{padding:"7px 14px",fontSize:11,borderRadius:9}}>Ver todos →</GlowBtn>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14}}>
                  {[{op:"Claro",name:"Fibra 200 Mbps",price:89900,speed:200,benefits:["HBO Max 3m","WiFi 6","Inst. gratis"],glow:"#e2001a",emoji:"🔴"},{op:"Movistar",name:"Móvil 20GB Pro",price:45900,benefits:["20GB 4G","Roaming LatAm","Sin permanencia"],glow:"#00aa44",emoji:"🟢",badge:"MEJOR PRECIO"},{op:"Tigo",name:"Internet+TV 300",price:125900,speed:300,benefits:["140 Canales HD","IP Fija","Cloud DVR"],glow:"#00a0e3",emoji:"🔵",badge:"TODO EN UNO"},{op:"ETB",name:"Fibra Social",price:0,speed:30,benefits:["Estrato 1 y 2","Sin costo mensual","Inst. gratis"],glow:C.green,emoji:"🟡",badge:"GRATIS"}].map((p,i)=>(
                    <Card key={i} glow={p.glow} style={{padding:18,position:"relative",cursor:"default"}}
                      onMouseEnter={(e:any)=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 28px ${p.glow}18`;}}
                      onMouseLeave={(e:any)=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 0 24px ${p.glow}12`;}}
                    >
                      {(p as any).badge&&<div style={{position:"absolute",top:0,right:12,background:`linear-gradient(135deg,${p.glow},${p.glow}99)`,color:"#fff",fontSize:8,fontWeight:900,padding:"3px 9px",borderRadius:"0 0 7px 7px"}}>{(p as any).badge}</div>}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}><span style={{fontSize:14}}>{p.emoji}</span><span style={{color:p.glow,fontWeight:800,fontSize:11}}>{p.op}</span></div>
                      <div style={{fontWeight:800,fontSize:13,marginBottom:7,color:"#fff"}}>{p.name}</div>
                      <div style={{fontWeight:900,fontSize:22,color:p.glow,marginBottom:8}}>{p.price===0?"GRATIS":`$${p.price.toLocaleString()}`}<span style={{fontSize:9,color:C.muted,fontWeight:600}}>/mes</span></div>
                      {(p as any).speed&&<div style={{color:C.muted,fontSize:10,marginBottom:7}}>⚡ {(p as any).speed} Mbps</div>}
                      {p.benefits.map(b=><div key={b} style={{display:"flex",gap:5,marginBottom:3}}><Check size={9} color={p.glow}/><span style={{color:C.muted,fontSize:10}}>{b}</span></div>)}
                      <div style={{display:"flex",gap:6,marginTop:11}}>
                        <button onClick={()=>addToCart({id:`plan-${i}`,name:`${p.op} ${p.name}`,price:p.price,emoji:p.emoji,color:p.glow,qty:1})} style={{flex:1,background:`${p.glow}12`,border:`1px solid ${p.glow}28`,borderRadius:8,padding:"7px 0",color:p.glow,fontWeight:700,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,transition:"all .15s"}}
                          onMouseEnter={(e:any)=>{e.currentTarget.style.background=`${p.glow}22`;}}
                          onMouseLeave={(e:any)=>{e.currentTarget.style.background=`${p.glow}12`;}}
                        ><ShoppingCart size={11}/>Agregar</button>
                        <WABtn name={`${p.op} ${p.name}`} label="Contratar" style={{flex:1,borderRadius:8,padding:"7px 0",fontSize:11}}/>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* EMPRESAS */}
              <section>
                <Chip color={C.cyan}>SOLUCIONES EMPRESARIALES</Chip>
                <h2 style={{fontWeight:900,fontSize:"clamp(1.1rem,3vw,1.5rem)",margin:"8px 0 14px",color:"#fff"}}>Comunicaciones para tu negocio</h2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>
                  {[{emoji:"☎️",name:"PBX Virtual",desc:"Central telefónica en la nube sin hardware.",price:"Desde $89.900/mes",color:C.neon},{emoji:"💬",name:"WhatsApp IA",desc:"Chatbots inteligentes y automatización 24/7.",price:"Desde $149.900/mes",color:C.green},{emoji:"🎙️",name:"VoIP Empresarial",desc:"Llamadas IP con alta calidad y bajo costo.",price:"Desde $59.900/mes",color:C.cyan}].map((s,i)=>(
                    <Card key={i} glow={s.color} style={{padding:18,cursor:"pointer"}}
                      onMouseEnter={(e:any)=>{e.currentTarget.style.transform="translateY(-3px)";}}
                      onMouseLeave={(e:any)=>{e.currentTarget.style.transform="";}}
                    >
                      <div style={{fontSize:26,marginBottom:9}}>{s.emoji}</div>
                      <div style={{color:s.color,fontWeight:800,fontSize:13,marginBottom:5}}>{s.name}</div>
                      <div style={{color:C.muted,fontSize:11,marginBottom:9,lineHeight:1.5}}>{s.desc}</div>
                      <div style={{color:"#fff",fontWeight:700,fontSize:11,marginBottom:11}}>{s.price}</div>
                      <WABtn name={s.name} label="Solicitar info" full style={{borderRadius:8,fontSize:11,padding:"8px"}}/>
                    </Card>
                  ))}
                </div>
              </section>

              {/* OFERTAS */}
              <section>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div><Chip color={C.red}>🔥 OFERTAS ESPECIALES</Chip><h2 style={{fontWeight:900,fontSize:"clamp(1.1rem,3vw,1.5rem)",marginTop:8,color:"#fff"}}>Equipos y accesorios tech</h2></div>
                  <span style={{color:C.red,fontSize:11,fontWeight:800,animation:"blink 2s infinite"}}>⚡ Solo hoy</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:11}}>
                  {[{name:"Router WiFi 6 AX3000",price:189900,old:289900,emoji:"📡",badge:"-34%",color:C.neon},{name:"Repetidor Mesh Tenda",price:89900,old:129900,emoji:"📶",badge:"-31%",color:C.cyan},{name:"Cable Cat8 10m",price:29900,old:45900,emoji:"🌐",badge:"-35%",color:C.green},{name:"Gaming Mouse 25K",price:149900,old:249900,emoji:"🖱️",badge:"-40%",color:C.red},{name:"Auriculares ANC Pro",price:119900,old:199900,emoji:"🎧",badge:"-40%",color:C.neon2},{name:"Cargador 65W GaN",price:49900,old:79900,emoji:"🔋",badge:"-37%",color:C.yellow}].map((item,i)=>(
                    <div key={i} style={{background:"rgba(8,6,28,0.7)",border:`1px solid ${item.color}18`,borderRadius:13,padding:"13px 11px",cursor:"pointer",transition:"all .2s",position:"relative"}}
                      onMouseEnter={(e:any)=>{e.currentTarget.style.border=`1px solid ${item.color}44`;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 22px ${item.color}14`;}}
                      onMouseLeave={(e:any)=>{e.currentTarget.style.border=`1px solid ${item.color}18`;e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="none";}}
                    >
                      <div style={{position:"absolute",top:7,left:7,background:C.red,color:"#fff",borderRadius:6,padding:"2px 6px",fontSize:9,fontWeight:900}}>{item.badge}</div>
                      <div style={{fontSize:28,textAlign:"center",margin:"16px 0 9px"}}>{item.emoji}</div>
                      <div style={{color:"#fff",fontWeight:700,fontSize:11,marginBottom:4,textAlign:"center",lineHeight:1.3}}>{item.name}</div>
                      <div style={{textAlign:"center",marginBottom:8}}><span style={{color:item.color,fontWeight:900,fontSize:13}}>${item.price.toLocaleString()}</span><span style={{color:C.muted,fontSize:9,textDecoration:"line-through",marginLeft:5}}>${item.old.toLocaleString()}</span></div>
                      <button onClick={()=>addToCart({id:`offer-${i}`,name:item.name,price:item.price,emoji:item.emoji,color:item.color,qty:1})} style={{width:"100%",background:`${item.color}12`,border:`1px solid ${item.color}28`,borderRadius:7,padding:"6px 0",color:item.color,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                        <ShoppingCart size={10}/>Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* ETB SOCIAL */}
              <section>
                <Card glow={C.green} style={{padding:"28px 26px",background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(5,150,105,0.03))"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:16,alignItems:"center"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><Shield size={20} color={C.green}/><Chip color={C.green}>PROGRAMA SOCIAL ETB · GRATUITO</Chip></div>
                      <h2 style={{fontWeight:900,fontSize:"clamp(1.1rem,3vw,1.4rem)",marginBottom:7,color:"#fff"}}>Conexión Social ETB</h2>
                      <p style={{color:C.muted,marginBottom:14,fontSize:12,lineHeight:1.6,maxWidth:420}}>Programa del Distrito de Bogotá para hogares de bajos recursos. Internet de alta velocidad <strong style={{color:C.green}}>completamente gratuito</strong>. Estrato 1 y 2.</p>
                      <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                        <input type="text" placeholder="Número de cédula" style={{background:"rgba(255,255,255,0.05)",border:`1px solid rgba(16,185,129,0.25)`,borderRadius:9,padding:"9px 13px",color:"#fff",fontSize:12,outline:"none",width:175}}/>
                        <GlowBtn onClick={()=>window.open("https://sites.google.com/etb.com.co/portalcs","_blank")} gradient="linear-gradient(135deg,#10b981,#059669)" glow={C.green} style={{borderRadius:9,padding:"9px 16px",fontSize:12}}>
                          <span style={{display:"flex",alignItems:"center",gap:5}}><Search size={12}/>Consultar</span>
                        </GlowBtn>
                      </div>
                    </div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:52}}>🏠</div><div style={{color:C.green,fontWeight:900,fontSize:20,marginTop:4}}>$0<span style={{fontSize:11,color:C.muted,fontWeight:600}}>/mes</span></div></div>
                  </div>
                </Card>
              </section>

              {/* BLOG */}
              <section>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><BookOpen size={15} color={C.neon}/><span style={{color:"#fff",fontWeight:800,fontSize:14}}>Blog & Tips</span><Chip color={C.neon}>NEW</Chip></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:11}}>
                  {[{e:"📡",t:"WiFi 6 vs WiFi 5: ¿Vale la pena?",tag:"Tecnología",min:4},{e:"💡",t:"5 tips para mejorar tu señal",tag:"Tips",min:3},{e:"🔒",t:"Cómo proteger tu red doméstica",tag:"Seguridad",min:5},{e:"📱",t:"Mejores planes móviles 2025",tag:"Comparativa",min:6}].map((p,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.borderSoft}`,borderRadius:11,padding:"12px 13px",cursor:"pointer",transition:"all .15s",display:"flex",gap:10,alignItems:"center"}}
                      onMouseEnter={(e:any)=>{e.currentTarget.style.background="rgba(0,212,255,0.05)";e.currentTarget.style.borderColor=C.border;}}
                      onMouseLeave={(e:any)=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor=C.borderSoft;}}
                    >
                      <span style={{fontSize:22,flexShrink:0}}>{p.e}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:"#fff",fontWeight:700,fontSize:12,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.t}</div>
                        <div style={{display:"flex",gap:7}}><Chip color={C.neon}>{p.tag}</Chip><span style={{color:C.muted,fontSize:9,alignSelf:"center"}}>📖 {p.min} min</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <div style={{display:"flex",flexDirection:"column",gap:16,position:"sticky",top:106}}>
              <div>
                <div style={{color:"rgba(0,212,255,0.35)",fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:9}}>ACCESOS RÁPIDOS</div>
                <QuickCards/>
              </div>
              <div style={{background:"rgba(8,6,28,0.7)",border:`1px solid ${C.borderSoft}`,borderRadius:13,padding:"13px 13px"}}>
                <div style={{color:"rgba(0,212,255,0.3)",fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:8}}>BUSCAR PLANES</div>
                <div onClick={()=>setSearchOpen(true)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.borderSoft}`,borderRadius:9,padding:"8px 11px",cursor:"text",transition:"border-color .18s"}}
                  onMouseEnter={(e:any)=>e.currentTarget.style.borderColor=C.border}
                  onMouseLeave={(e:any)=>e.currentTarget.style.borderColor=C.borderSoft}
                >
                  <Search size={12} color={C.muted}/><span style={{color:"rgba(180,190,220,0.3)",fontSize:11}}>Buscar…</span><kbd style={{marginLeft:"auto",color:C.muted,fontSize:9,border:`1px solid ${C.borderSoft}`,borderRadius:4,padding:"1px 5px"}}>⌘K</kbd>
                </div>
              </div>
              <div style={{background:"rgba(8,6,28,0.7)",border:`1px solid ${C.borderSoft}`,borderRadius:13,padding:"13px 13px"}}>
                <div style={{color:"rgba(0,212,255,0.3)",fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:11}}>ESTADÍSTICAS HOY</div>
                {[{l:"Operadores comparados",v:"+15",c:C.neon},{l:"Usuarios beneficiados",v:"1.5K+",c:C.green},{l:"Ahorro promedio/mes",v:"$38K",c:C.yellow},{l:"Planes disponibles",v:"+14K",c:C.neon2}].map((s,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<3?`1px solid rgba(255,255,255,0.04)`:"none"}}>
                    <span style={{color:C.muted,fontSize:10.5}}>{s.l}</span>
                    <span style={{color:s.c,fontWeight:900,fontSize:13}}>{s.v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"linear-gradient(135deg,rgba(102,0,204,0.15),rgba(236,72,153,0.1))",border:`1px solid rgba(168,85,247,0.25)`,borderRadius:13,padding:"15px 13px",textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:7}}>🎁</div>
                <div style={{color:"#fff",fontWeight:800,fontSize:12,marginBottom:4}}>Refiere & Gana</div>
                <div style={{color:C.muted,fontSize:10,marginBottom:11,lineHeight:1.5}}>Premios · Cashback<br/>Bonos Sodexo y más</div>
                <WABtn name="programa Refiere y Gana" label="Inscribirte Gratis" full style={{borderRadius:9,fontSize:11,padding:"8px 12px"}}/>
              </div>
              <div style={{background:"linear-gradient(135deg,rgba(0,80,170,0.15),rgba(0,212,255,0.08))",border:`1px solid ${C.border}`,borderRadius:13,padding:"15px 13px",textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:7}}>🏠</div>
                <div style={{color:"#fff",fontWeight:800,fontSize:12,marginBottom:4}}>Diseñar Hogar Digital</div>
                <div style={{color:C.muted,fontSize:10,marginBottom:11,lineHeight:1.5}}>Conecta tus dispositivos<br/>y encuentra tu plan ideal</div>
                <GlowBtn onClick={()=>setView("game")} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={C.neon} style={{width:"100%",borderRadius:9,fontSize:11,padding:"8px 12px"}}>🚀 Iniciar Misión</GlowBtn>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{background:"rgba(4,4,15,0.99)",borderTop:`1px solid ${C.borderSoft}`,padding:"36px 20px 22px"}}>
        <div style={{maxWidth:1380,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:24,marginBottom:28}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#00d4ff,#0080ff)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 14px #00d4ff44"}}><Zap size={16} color="#fff" strokeWidth={2.5}/></div>
                <div>
                  <div style={{display:"flex",alignItems:"baseline",gap:0}}><span style={{fontWeight:900,fontSize:14,color:"#fff"}}>Compara</span><span style={{fontWeight:900,fontSize:14,background:"linear-gradient(90deg,#00d4ff,#0080ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Tu</span><span style={{fontWeight:900,fontSize:14,color:"#ff6b35"}}>Plan</span><span style={{fontWeight:700,fontSize:10,color:"rgba(0,212,255,0.5)"}}>{">"}.com</span></div>
                  <div style={{fontSize:7,fontWeight:700,letterSpacing:1.5,color:"rgba(0,212,255,0.3)"}}>COLOMBIA · TELCO #1</div>
                </div>
              </div>
              <p style={{color:C.muted,fontSize:11,lineHeight:1.6,maxWidth:190}}>La plataforma #1 en Colombia para comparar y contratar planes de telecomunicaciones.</p>
            </div>
            {[{title:"Servicios",links:["Internet Hogar","Planes Móviles","TV + Streaming","Combos"]},{title:"Empresas",links:["PBX Virtual","WhatsApp IA","VoIP","Fibra Dedicada"]},{title:"Legal",links:["Términos y Condiciones","Política de Privacidad","Habeas Data"]}].map(col=>(
              <div key={col.title}>
                <div style={{color:"rgba(0,212,255,0.3)",fontSize:8.5,fontWeight:800,letterSpacing:1.5,marginBottom:10}}>{col.title.toUpperCase()}</div>
                {col.links.map(l=>(
                  <a key={l} href="#" style={{display:"block",color:C.muted,fontSize:11,fontWeight:600,textDecoration:"none",marginBottom:7,transition:"color .14s"}}
                    onMouseEnter={(e:any)=>e.currentTarget.style.color=C.neon}
                    onMouseLeave={(e:any)=>e.currentTarget.style.color=C.muted}
                  >{l}</a>
                ))}
              </div>
            ))}
            <div>
              <div style={{color:"rgba(0,212,255,0.3)",fontSize:8.5,fontWeight:800,letterSpacing:1.5,marginBottom:10}}>CONTACTO</div>
              <button onClick={()=>openWA("consulta")} style={{background:"linear-gradient(135deg,#1aab58,#0d7a3e)",border:"1px solid rgba(37,211,102,0.2)",borderRadius:9,padding:"8px 13px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:8}}><WaIco/>+57 305 787 6992</button>
              <p style={{color:C.muted,fontSize:10}}>Bogotá, Colombia 🇨🇴<br/>Atención 24/7</p>
            </div>
          </div>
          <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.2),transparent)",marginBottom:14}}/>
          <p style={{color:"rgba(0,212,255,0.2)",fontSize:10,textAlign:"center"}}>© 2025 ComparaTuPlan.com · Todos los derechos reservados · Bogotá, Colombia</p>
        </div>
      </footer>
    </div>
  );
}