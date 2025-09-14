<template>
    <div class="descargador-container">
      <h2 class="titulo">Descargar Plantilla de Movimiento Bancario</h2>
      <div class="boton-descarga">
        <el-button type="primary" size="large" @click="descargarPlantilla">
          <i class="el-icon-download" style="margin-right: 8px"></i>
          Descargar Plantilla
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import * as XLSX from 'xlsx';
  
  const descargarPlantilla = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [['Tipo de asiento','Fecha', 'Descripcion','Tercero','Cuenta','Contrapartida', 'Débito', 'Crédito',  'Saldo']];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'PlantillaBancos');
    XLSX.writeFile(wb, 'plantilla_bancos.xlsx');
  };
  </script>
  
  <style scoped>
  .descargador-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40px;
  }
  
  .titulo {
    font-size: 24px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .boton-descarga {
    display: flex;
    justify-content: center;
  }
  </style>
  