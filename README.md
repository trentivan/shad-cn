## Instrucciones para ejecutar el proyecto en local

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Genera los archivos necesarios de Prisma (este paso es obligatorio para que el proyecto funcione correctamente):
   ```bash
   npx prisma generate
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## Para acceder al sistema completo se necesitan credenciales de administrador

### credenciales de acceso:
#### Administrador:
- correo: `kevin@gmail.com`
- Contraseña: `123456`

Para el caso de las vistas de no administrador, solo es necesario revisar una vista, ya que a este punto son las mismas para
usuario externo y colaborador:

#### Usuario externo:
- correo: `usuarioprueba@gmail.com`
- Contraseña: `123456`