import { TEMPLATE_CONFIG } from "../config/templates";

export default function Contemporary({ state }) {

  const config = TEMPLATE_CONFIG.contemporary;


  return (

    <div
      id="card"
      style={{
        width: "1080px",
        height: "1350px",

        position: "relative",
        overflow: "hidden",

        background: "#ffffff",

        fontFamily:
          "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",

        color: "white",
      }}
    >


     {/* BACKGROUND IMAGE */}
{state.background && (

  <div

    style={{

      position: "absolute",

      inset: 0,

      backgroundImage:
        `url(${state.background})`,

      backgroundSize: "cover",

      backgroundPosition:
        state.backgroundPosition || "center",

      backgroundRepeat: "no-repeat",

      opacity:
        state.backgroundOpacity ?? 0.95,

      filter: `
        brightness(${state.backgroundBrightness ?? 1.15})
        blur(${state.backgroundBlur ?? 0}px)
        saturate(1.15)
        contrast(1.08)
      `,

      transform: "scale(1.03)",

      transition: "all .25s ease",

      zIndex: 0

    }}

  />

)}


      {/* DARK OVERLAY */}

      <div

        style={{

          position:"absolute",

          top:0,
          left:0,

          width:"100%",
          height:"100%",


          background:
            "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,.72))",


          zIndex:1,

        }}

      />





      {/* SUBCATEGORY */}

      <div

        style={{

          position:"absolute",

          top:64,
          left:72,

          zIndex:2,


          display:"inline-flex",
          alignItems:"center",


          borderLeft:"5px solid #ff0000",

          background:"rgba(255,255,255,0.12)",

          backdropFilter:"blur(8px)",


          padding:"10px 22px 10px 18px",

          borderRadius:"0 40px 40px 0",


          fontSize:30,

          fontWeight:600,

          color:"white",

          maxWidth:480,

        }}

      >

        {state.subcategory}


      </div>






      {/* LOGO */}

      <img

        src={config.logo}

        alt="logo"

        crossOrigin="anonymous"


        style={{

          position:"absolute",

          top:48,

          right:24,

          height:112,

          zIndex:2,

        }}

      />







{/* HEADLINE AREA */}

<div
  style={{
    position: "absolute",
    top: 800,
    left: 72,
    right: 72,
    zIndex: 2,
  }}
>

  {/* RED LINE */}

  <div
  style={{
    width: `${Math.min(
      Math.max(
        state.headline.length * 32,
        120
      ),
      900
    )}px`,

    height: 4,

    background: "#ff0000",

    borderRadius: 2,

    marginBottom: 36,

    marginLeft:
      state.headlineAlign === "center" ||
      state.headlineAlign === "right"
        ? "auto"
        : 0,

    marginRight:
      state.headlineAlign === "center" ||
      state.headlineAlign === "left"
        ? "auto"
        : 0,
  }}
/>



  {/* HEADLINE */}

  <h1
    style={{
      fontSize: 58,
      fontWeight: 700,
      lineHeight: 1.20,

      color: "white",

      textAlign:
        state.headlineAlign || "left",

      textShadow:
        "0 2px 24px rgba(0,0,0,0.55)",

    }}
  >

  {
    state.highlightWord

    ?

    state.headline
    .split(
      new RegExp(
        `(${state.highlightWord})`,
        "g"
      )
    )

    .map((part,index)=>(

      <span
        key={index}
        style={{

          color:
          part === state.highlightWord

          ?

          state.highlightColor

          :

          "white"

        }}
      >

        {part}

      </span>

    ))

    :

    state.headline

  }


  </h1>


  {/* DIVIDER */}

  <div
    style={{
      width:48,
      height:2,
      background:
      "rgba(255,255,255,0.35)",

      marginTop:28,

      marginLeft:
      state.headlineAlign === "center"
      ?
      "auto"
      :
      state.headlineAlign === "right"
      ?
      "auto"
      :
      0,

      marginRight:
      state.headlineAlign === "center"
      ?
      "auto"
      :
      state.headlineAlign === "left"
      ?
      "auto"
      :
      0,
    }}
  />


</div>



      {/* DATE */}

      <div

        style={{

          position:"absolute",

          bottom:60,

          left:30,


          zIndex:2,


          fontSize:26,

          opacity:0.85,

        }}

      >

        {state.date}

      </div>







      {/* SOURCE */}

      <div

        style={{

          position:"absolute",

          bottom:60,

          right:30,


          zIndex:2,


          fontSize:26,


          opacity:0.85,

        }}

      >

        সূত্র: {state.source}

      </div>







      {/* COPYRIGHT */}

      <div

        style={{

          position:"absolute",

          bottom:10,

          left:"50%",


          transform:"translateX(-50%)",


          zIndex:2,


          fontSize:30,


          opacity:0.7,

        }}

      >

        {config.copyright}

      </div>




    </div>

  );

}