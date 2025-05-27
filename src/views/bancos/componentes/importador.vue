<template>
    <div class="importador-container">
      <h2 class="titulo">Importar Movimientos Bancarios</h2>
      <input type="file" @change="leerArchivo" accept=".xlsx, .xls" />
  
      <el-table
        v-if="datos.length"
        :data="datos"
        style="width: 100%; margin-top: 20px"
        border
        height="500px"
      >
        <el-table-column
          v-for="(col, index) in columnas"
          :key="index"
          :prop="col"
          :label="col"
        >
          <template #default="scope">
            <el-input v-model="scope.row[col]" size="small" />
          </template>
        </el-table-column>
      </el-table>
  
      <el-button
        v-if="datos.length"
        type="success"
        style="margin-top: 20px"
        @click="guardarDatos"
      >
        Contabilizar
      </el-button>
    </div>
  </template>
  
  <script setup>
  import * as XLSX from 'xlsx'
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  
  const datos = ref([])
  const columnas = ref([])
  
  const leerArchivo = (e) => {
    const archivo = e.target.files[0]
    const lector = new FileReader()
  
    lector.onload = (evt) => {
      const data = new Uint8Array(evt.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const hoja = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(hoja, { header: 1 })
  
      if (json.length > 1) {
        columnas.value = json[0]
        datos.value = json.slice(1).map((row) =>
          Object.fromEntries(row.map((cell, index) => [json[0][index], cell]))
        )
      } else {
        ElMessage.error('La hoja está vacía o el formato no es válido.')
      }
    }
  
    lector.readAsArrayBuffer(archivo)
  }
  
  const guardarDatos = () => {
    console.log('Datos a guardar:', datos.value)
    ElMessage.success('Datos preparados para guardar')
    // Aquí más adelante puedes agregar una petición a tu API, o guardarlos localmente.
  }
  </script>
  
  <style scoped>
  .importador-container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .titulo {
    font-size: 24px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 20px;
  }
  </style>
  