import { colorFor } from "../lib/utils.js";

export default function Avatar({ name, photo, size = 44 }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: colorFor(name || "x"), color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 500,
      }}
    >
      {initials || "?"}
    </div>
  );
}
