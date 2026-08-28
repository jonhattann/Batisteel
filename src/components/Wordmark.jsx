import { FULL_LOGO } from "../assets/brand.js";

export default function Wordmark({ width = 160 }) {
  return (
    <img
      src={FULL_LOGO}
      alt="OGEN — Ancré pour développer"
      width={width}
      style={{ display: "block", width, height: "auto" }}
    />
  );
}
