# 🚀 Property Import Tool

Herramienta completa para importar propiedades desde diferentes CMS y formatos de datos.

## 📋 Características

- ✅ **Múltiples formatos**: WordPress, CSV, JSON genérico
- ✅ **Mapeo automático**: Campos adaptados al esquema de Metroland
- ✅ **Validación**: Verificación de datos requeridos
- ✅ **Usuario admin**: Creación automática de usuario administrador
- ✅ **Logging detallado**: Seguimiento del proceso de importación

## 🚀 Uso Rápido

### Importar desde CSV
```bash
cd backend-fastify
npm run import:properties csv scripts/sample-data/properties-sample.csv
```

### Importar desde JSON
```bash
npm run import:properties json scripts/sample-data/properties-sample.json
```

### Importar desde WordPress
```bash
npm run import:properties wordpress ./data/wp-export.json
```

## 📄 Formatos Soportados

### CSV Format
```csv
Title,Address,Price,Type,Bedrooms,Bathrooms,Area,Description,Latitude,Longitude,Images,Phone,Email
Beautiful Modern House,123 Main Street,450000,house,4,3,2500,Description here,40.7128,-74.0060,image1.jpg;image2.jpg,+1234567890,contact@email.com
```

### JSON Format
```json
[
  {
    "name": "Property Name",
    "address": "123 Main St",
    "price": 250000,
    "type": "house",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "description": "Property description",
    "features": ["3 bedrooms", "2 bathrooms"],
    "images": ["url1", "url2"],
    "contactNumber": "+1234567890",
    "contactEmail": "contact@email.com"
  }
]
```

### WordPress Export
```json
[
  {
    "ID": 123,
    "post_title": "Property Title",
    "post_content": "Property description",
    "post_type": "property",
    "meta": {
      "_property_address": "123 Main St",
      "_property_price": "250000",
      "_property_type": "house",
      "_property_latitude": "40.7128",
      "_property_longitude": "-74.0060",
      "_property_images": ["image1.jpg", "image2.jpg"]
    }
  }
]
```

## 🔧 Mapeo de Campos

### Tipos de Propiedad Soportados
- `house` - Casa
- `apartment` - Apartamento
- `condo` - Condominio
- `townhouse` - Casa adosada
- `land` - Terreno
- `commercial` - Comercio
- `villa` - Villa

### Campos Obligatorios
- `name` o `title` - Nombre de la propiedad
- `address` - Dirección

### Campos Opcionales
- `price` - Precio (número)
- `type` - Tipo de propiedad
- `latitude/longitude` - Coordenadas GPS
- `description` - Descripción detallada
- `images` - Array de URLs de imágenes
- `contactNumber` - Teléfono de contacto
- `contactEmail` - Email de contacto

## 🛠️ Desarrollo y Personalización

### Agregar Nuevo CMS
```javascript
// En import-properties.js, agregar nuevo mapping
const CMS_MAPPINGS = {
  nuevo_cms: {
    title: 'campo_titulo',
    address: 'campo_direccion',
    price: 'campo_precio',
    // ... más campos
  }
};
```

### Crear Nuevo Mapper
```javascript
mapNuevoCMSProperty(cmsData) {
  return {
    property_id: `cms-${Date.now()}`,
    name: cmsData.campo_titulo,
    address: cmsData.campo_direccion,
    // ... mapear otros campos
  };
}
```

## 📊 Usuario Administrador

La herramienta crea automáticamente un usuario administrador:

- **Email**: `admin@metroland.com`
- **Contraseña**: `admin123`
- **Rol**: Administrador completo

## 🔍 Solución de Problemas

### Error de Conexión MongoDB
```bash
# Asegurarse de que MongoDB esté ejecutándose
mongod

# O usar MongoDB Atlas
# Actualizar DB_CONNECT en .env.development
```

### Archivo No Encontrado
```bash
# Verificar ruta del archivo
ls -la ./data/mi-archivo.csv

# Usar ruta absoluta si es necesario
npm run import:properties csv /ruta/completa/archivo.csv
```

### Campos Vacíos
- La herramienta omite propiedades sin `name` o `address`
- Revisa el formato de tu archivo de origen
- Verifica el mapeo de campos para tu CMS

## 📈 Rendimiento

- **Lote processing**: Procesa propiedades en lotes para evitar sobrecarga
- **Validación**: Verifica datos antes de guardar
- **Logging**: Reporta progreso y errores detalladamente
- **Rollback**: Detiene importación en caso de errores críticos

## 🔒 Seguridad

- ✅ **Validación de datos**: Todos los inputs son validados
- ✅ **Sanitización**: URLs y paths seguros
- ✅ **Usuario dedicado**: Importaciones asignadas a usuario admin
- ✅ **No producción**: Solo funciona en desarrollo

## 📞 Soporte

Para soporte técnico o agregar nuevos formatos de importación, contacta al equipo de desarrollo.