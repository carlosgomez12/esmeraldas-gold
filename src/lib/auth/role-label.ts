export function roleLabel(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super administrador";
    case "ADMIN":
      return "Administrador";
    case "EDITOR":
      return "Editor";
    case "SALES":
      return "Ventas";
    default:
      return role;
  }
}