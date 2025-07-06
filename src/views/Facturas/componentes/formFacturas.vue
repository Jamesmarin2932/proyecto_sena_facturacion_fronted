<template>
  <div>
    <el-form label-width="120px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="N° Factura">
            <el-input v-model="numeroFactura" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Cliente">
            <el-autocomplete
              v-model="clienteNombre"
              :fetch-suggestions="buscarClientes"
              placeholder="Buscar cliente"
              @select="seleccionarCliente"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Fecha">
            <el-date-picker v-model="fecha" type="date" placeholder="Seleccionar fecha" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider />

      <el-button type="primary" @click="agregarProducto">Agregar Producto</el-button>

      <el-table :data="productosSeleccionados" style="width: 100%; margin-top: 20px;">
        <el-table-column label="Producto">
          <template #default="{ row }">
            <el-select v-model="row.codigo_del_producto" placeholder="Producto">
              <el-option
                v-for="producto in productosDisponibles"
                :key="producto.id"
                :label="producto.nombre"
                :value="producto.id"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="Cantidad">
          <template #default="{ row }">
            <el-input-number v-model="row.cantidad" :min="1" />
          </template>
        </el-table-column>

        <el-table-column label="Precio Unitario">
          <template #default="{ row }">
            <el-input-number v-model="row.precio_unitario" :min="0" :step="0.01" />
          </template>
        </el-table-column>

        <el-table-column label="Descuento">
          <template #default="{ row }">
            <el-input-number v-model="row.descuento" :min="0" :step="0.01" />
          </template>
        </el-table-column>

        <el-table-column label="Acciones">
          <template #default="{ $index }">
            <el-button type="danger" icon="el-icon-delete" @click="eliminarProducto($index)" circle />
          </template>
        </el-table-column>
      </el-table>

      <el-divider />

      <div style="text-align: right;">
        <p><strong>Subtotal:</strong> ${{ calcularTotales.subTotal.toFixed(2) }}</p>
        <p><strong>Descuento Total:</strong> ${{ calcularTotales.descuentoTotal.toFixed(2) }}</p>
        <p><strong>IVA (19%):</strong> ${{ calcularTotales.iva.toFixed(2) }}</p>
        <p><strong>Total:</strong> ${{ calcularTotales.total.toFixed(2) }}</p>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <el-button @click="$emit('cancelado')">Cancelar</el-button>
        <el-button type="primary" @click="validarYGuardar" :disabled="productosSeleccionados.length === 0">
          Guardar Factura
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const props = defineProps({ factura: Object })
const emit = defineEmits(['guardado', 'cancelado'])

const numeroFactura = ref('FV-00001')
const clienteSeleccionado = ref(null)
const clienteNombre = ref('')
const fecha = ref(new Date())
const productosSeleccionados = ref([])

const clientes = ref([])
const productosDisponibles = ref([])

const buscarClientes = async (queryString, cb) => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/dato_clientes/getdata')
    const lista = Array.isArray(res.data.data) ? res.data.data : []

    const resultados = lista
      .filter(c => {
        const nombre = c.nombres || ''
        const apellido = c.apellidos || ''
        const nombreCompleto = `${nombre} ${apellido}`.toLowerCase()
        return nombreCompleto.includes(queryString.toLowerCase())
      })
      .map(c => ({
        value: `${c.nombres || ''} ${c.apellidos || ''}`,
        id: c.id
      }))

    cb(resultados)
  } catch (error) {
    console.error('Error al buscar clientes:', error)
    cb([])
  }
}

const seleccionarCliente = (item) => {
  clienteSeleccionado.value = item.id
  clienteNombre.value = item.value
}

const cargarProductos = async () => {
  try {
    const res = await axios.get('/nombre_productos/getdata')
    productosDisponibles.value = res.data
  } catch (error) {
    ElMessage.error('Error al cargar productos')
  }
}

onMounted(() => {
  cargarProductos()
})

watch(
  () => props.factura,
  (nuevaFactura) => {
    if (nuevaFactura) {
      numeroFactura.value = nuevaFactura.numero_factura || 'FV-00001'
      clienteSeleccionado.value = nuevaFactura.cliente_id || null
      fecha.value = nuevaFactura.fecha ? new Date(nuevaFactura.fecha) : new Date()
      productosSeleccionados.value = nuevaFactura.productos
        ? nuevaFactura.productos.map(p => ({
            codigo_del_producto: p.codigo_del_producto,
            cantidad: p.cantidad,
            precio_unitario: p.precio_unitario,
            descuento: p.descuento || 0
          }))
        : []
    } else {
      numeroFactura.value = 'FV-00001'
      clienteSeleccionado.value = null
      clienteNombre.value = ''
      fecha.value = new Date()
      productosSeleccionados.value = []
    }
  },
  { immediate: true }
)

const agregarProducto = () => {
  productosSeleccionados.value.push({
    codigo_del_producto: null,
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0
  })
}

const eliminarProducto = (index) => {
  productosSeleccionados.value.splice(index, 1)
}

const calcularTotales = computed(() => {
  let subTotal = 0
  let descuentoTotal = 0

  productosSeleccionados.value.forEach((p) => {
    const subtotalItem = p.cantidad * p.precio_unitario
    subTotal += subtotalItem
    descuentoTotal += p.descuento || 0
  })

  const baseImponible = subTotal - descuentoTotal
  const iva = baseImponible * 0.19
  const total = baseImponible + iva

  return {
    subTotal,
    descuentoTotal,
    iva,
    total
  }
})

const validarYGuardar = () => {
  if (!clienteSeleccionado.value) {
    ElMessage.warning('Debe seleccionar un cliente')
    return
  }

  if (productosSeleccionados.value.length === 0) {
    ElMessage.warning('Debe agregar al menos un producto')
    return
  }

  for (const p of productosSeleccionados.value) {
    if (!p.codigo_del_producto) {
      ElMessage.warning('Debe seleccionar un producto en todos los ítems')
      return
    }
    if (p.cantidad <= 0) {
      ElMessage.warning('La cantidad debe ser mayor que cero')
      return
    }
    if (p.precio_unitario < 0) {
      ElMessage.warning('El precio unitario no puede ser negativo')
      return
    }
  }

  const productosFormateados = productosSeleccionados.value.map((p) => {
    const productoInfo = productosDisponibles.value.find((prod) => prod.id === p.codigo_del_producto)
    const subtotal = p.cantidad * p.precio_unitario
    const descuento = p.descuento || 0
    const iva = (subtotal - descuento) * 0.19
    const total = subtotal - descuento + iva

    return {
      codigo_del_producto: p.codigo_del_producto,
      producto: productoInfo?.nombre || '',
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario,
      descuento,
      iva,
      total
    }
  })

  emit('guardado', {
    numero_factura: numeroFactura.value,
    cliente_id: clienteSeleccionado.value,
    fecha: fecha.value instanceof Date ? fecha.value.toISOString().split('T')[0] : fecha.value,
    productos: productosFormateados,
    sub_total: calcularTotales.value.subTotal,
    descuento: calcularTotales.value.descuentoTotal,
    iva: calcularTotales.value.iva,
    total: calcularTotales.value.total
  })

  productosSeleccionados.value = []
}
</script>
