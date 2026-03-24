# Vimmit Academic Backend

Sistema de Identidad y Gestión Académica desarrollado con FastAPI, SQLModel y UV.

## Requisitos
- Python 3.10+
- uv (instalador de paquetes)

## Instalación
```bash
uv sync
```

## Comandos (Scripts)
Para facilitar el desarrollo, usamos un `Makefile`. Estos comandos funcionan de forma similar a los `scripts` de un `package.json`:

| Comando | Descripción |
| :--- | :--- |
| `make test` | Ejecuta todas las pruebas unitarias con Pytest. |
| `make test-cov` | Ejecuta pruebas y muestra el reporte de cobertura en terminal. |
| `make test-html` | Genera un reporte de cobertura detallado en HTML (`htmlcov/`). |
| `make verify` | Ejecuta el script de verificación manual de IAM. |
| `make dev` | Inicia el servidor de desarrollo con Hot Reload. |

## Pruebas
Las pruebas se encuentran en la carpeta `src/tests`.

Para ver la cobertura:
```bash
make test-cov
```
