function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff", textAlign: "center" }}>
      <a href="#about" style={{ color: "#fff", margin: "10px" }}>About</a>
      <a href="#projects" style={{ color: "#fff", margin: "10px" }}>Projects</a>
      <a href="#contact" style={{ color: "#fff", margin: "10px" }}>Contact</a>
    </nav>
  );
}

export default Navbar;