import React, { useState } from "react"
import { Modal, IconButton, Box, Backdrop } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { Expand } from "lucide-react"

const Certificate = ({ ImgSertif, index }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300
          border border-white/[0.06] hover:border-indigo-500/40
          hover:shadow-[0_8px_32px_rgba(99,102,241,0.18)]
          hover:-translate-y-1"
      >
        {/* Image */}
        <img
          src={ImgSertif}
          alt="Certificate"
          className="w-full block transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-[0.55]"
          style={{ aspectRatio: "16/11.5", objectFit: "cover" }}
        />

        {/* Subtle bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2
          opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20
            flex items-center justify-center ring-1 ring-indigo-400/30
            shadow-[0_0_16px_rgba(99,102,241,0.3)]">
            <Expand className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-xs font-medium tracking-wide drop-shadow-lg">View Certificate</span>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: { backgroundColor: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" },
        }}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", outline: "none" }}>
          <IconButton
            onClick={() => setOpen(false)}
            size="large"
            sx={{
              position: "absolute", right: 12, top: 12, zIndex: 1,
              color: "white", bgcolor: "rgba(0,0,0,0.6)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.85)", transform: "scale(1.1)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <img
            src={ImgSertif}
            alt="Certificate"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </Box>
      </Modal>
    </>
  )
}

export default Certificate
