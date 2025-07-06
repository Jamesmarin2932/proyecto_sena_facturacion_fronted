<template>
  <layout-main>
    <template #slotlayout>
      <!-- Encabezado y botón para nueva factura -->
      <div class="header-container" v-if="!mostrarFormulario">
        <h1 class="titulo">FACTURACIÓN</h1>
        <div class="botones">
          <el-button type="primary" @click="abrirFormularioNuevo">Nueva Factura</el-button>
        </div>
      </div>

      <!-- Tabla de facturas -->
      <div v-if="!mostrarFormulario" style="margin-top: 20px;">
        <el-table :data="facturas" stripe style="width: 100%">
          <el-table-column prop="numero_factura" label="Número" width="120" />
          <el-table-column prop="fecha" label="Fecha" width="120" />
          <el-table-column label="Cliente" width="180">
            <template #default="{ row }">
              {{ row.cliente?.nombre || 'N/A' }}
            </template>
          </el-table-column>
          <el-table-column label="Productos">
            <template #default="{ row }">
              <ul style="padding-left: 20px; margin: 0;">
                <li v-for="prod in row.productos" :key="prod.id_producto">
                  {{ prod.nombre }} - Cantidad: {{ prod.cantidad }} - Precio: {{ prod.precio }}
                </li>
              </ul>
            </template>
          </el-table-column>
          <el-table-column prop="total" label="Total" width="100" />
          <el-table-column label="Acciones" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="abrirFormularioEdicion(row)">Editar</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Formulario de facturas -->
      <FormFactura
        v-if="mostrarFormulario"
        :factura="facturaSeleccionada"
        :clientes="clientes"
        :productosDisponibles="productosDisponibles"
        @cancelado="cerrarFormulario"
        @guardado="guardarFactura"
      />
    </template>
  </layout-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import LayoutMain from '../../components/LayoutMain.vue';
import FormFactura from '../Facturas/componentes/formFacturas.vue';

const facturas = ref([
  {
    id: 1,
    numero_factura: 'FV-00001',
    fecha: '2025-06-02',
    cliente: { id: 1, nombre: 'Cliente 1' },
    productos: [
      { id_producto: 1, nombre: 'Producto A', cantidad: 2, precio: 100 },
      { id_producto: 2, nombre: 'Producto B', cantidad: 1, precio: 50 },
    ],
    sub_total: 250,
    iva: 47.5,
    total: 297.5,
  },
]);

const clientes = ref([]);
const productosDisponibles = ref([]);
const mostrarFormulario = ref(false);
const facturaSeleccionada = ref(null);

const cargarDatos = async () => {
  try {
    const [clientesRes, productosRes] = await Promise.all([
      axios.get('/api/dato_clientes/getdata'),
      axios.get('/api/nombre_productos/getdata'),
    ]);

    clientes.value = clientesRes.data;
    productosDisponibles.value = productosRes.data;
  } catch (error) {
    console.error('Error al cargar clientes o productos:', error);
  }
};

onMounted(() => {
  cargarDatos();
});

const abrirFormularioNuevo = () => {
  facturaSeleccionada.value = {
    numero_factura: generarNumeroFactura(),
    fecha: '',
    id_cliente: null,
    productos: [],
  };
  mostrarFormulario.value = true;
};

const abrirFormularioEdicion = (factura) => {
  facturaSeleccionada.value = JSON.parse(JSON.stringify(factura));
  mostrarFormulario.value = true;
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  facturaSeleccionada.value = null;
};

const guardarFactura = (factura) => {
  if (factura.id) {
    const index = facturas.value.findIndex(f => f.id === factura.id);
    if (index !== -1) {
      factura.cliente = clientes.value.find(c => c.id === factura.id_cliente);
      factura.productos = factura.productos.map(p => {
        const prodInfo = productosDisponibles.value.find(prod => prod.id === p.id_producto);
        return {
          ...p,
          nombre: prodInfo ? prodInfo.nombre : 'Producto desconocido',
        };
      });
      facturas.value[index] = factura;
    }
  } else {
    factura.id = facturas.value.length + 1;
    factura.cliente = clientes.value.find(c => c.id === factura.id_cliente);
    factura.productos = factura.productos.map(p => {
      const prodInfo = productosDisponibles.value.find(prod => prod.id === p.id_producto);
      return {
        ...p,
        nombre: prodInfo ? prodInfo.nombre : 'Producto desconocido',
      };
    });
    facturas.value.push(factura);
  }
  cerrarFormulario();
};

const generarNumeroFactura = () => {
  const max = facturas.value.reduce((max, f) => {
    const n = parseInt(f.numero_factura.split('-')[1]);
    return n > max ? n : max;
  }, 0);
  const nuevoNumero = max + 1;
  return `FV-${nuevoNumero.toString().padStart(5, '0')}`;
};
</script>


<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 10px;
}

.titulo {
  flex: 1;
  text-align: center;
  margin: 0;
  font-weight: 600;
  font-size: 20px;
}

.botones {
  display: flex;
  gap: 10px;
}
</style>
