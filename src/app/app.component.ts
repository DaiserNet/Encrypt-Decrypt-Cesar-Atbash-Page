import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CifradoCesarAtbash';
  /* [1] */
  terminalUser = 'root@alkindi';
  alfabetoBase = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  moduloActivo: 'CESAR' | 'ATBASH' = 'CESAR';
  operacion: 'CIFRAR' | 'DESCIFRAR' = 'CIFRAR';
  desplazamientoCesar = 3;
  textoEntrada = '';
  textoSalida = '';

  analisisAlKindi: string = '';

  private esAscii = false;

  /* [2] */
  seleccionarModulo(modulo: 'CESAR' | 'ATBASH') {
    this.moduloActivo = modulo;
    this.analisisAlKindi = '';
    this.procesarTexto();
  }
  /* [3] */
  setOperacion(op: 'CIFRAR' | 'DESCIFRAR') {
    this.operacion = op;
    this.analisisAlKindi = '';
    this.procesarTexto();
  }
  /* [4] */
  procesarTexto() {
    if (!this.textoEntrada) {
      this.textoSalida = '';
      return;
    }

    let textoATrabajar = this.textoEntrada;

    const shift = this.operacion === 'CIFRAR' ? this.desplazamientoCesar : -this.desplazamientoCesar;

    if (this.moduloActivo === 'CESAR') {
      this.textoSalida = this.miLogicaCesar(textoATrabajar, shift, this.alfabetoBase);
    } else {
      this.textoSalida = this.miLogicaAtbash(textoATrabajar, this.alfabetoBase);
    }
  }

  /* [5] */
  private miLogicaCesar(texto: string, desplazamiento: number, alfabeto: string): string {
    let resultado = '';
    const N = alfabeto.length;
    if (N === 0) return texto;

    for (const char of texto) {
      const index = alfabeto.indexOf(char);
      if (index !== -1) {
        const newIndex = ((index + desplazamiento) % N + N) % N;
        resultado += alfabeto[newIndex];
      } else {
        resultado += char;
      }
    }
    return resultado;
  }
  /* [6] */
  private miLogicaAtbash(texto: string, alfabeto: string): string {
    let resultado = '';
    const N = alfabeto.length;
    for (const char of texto) {
      const index = alfabeto.indexOf(char);
      if (index !== -1) {
        resultado += alfabeto[N - 1 - index];
      } else {
        resultado += char;
      }
    }
    return resultado;
  }
  /* [7] */
  setPreset(opcion: number) {
    this.esAscii = false;
    this.analisisAlKindi = '';
    switch (opcion) {
      case 1: this.alfabetoBase = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz'; break;
      case 2: this.alfabetoBase = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz0123456789'; break;
      case 3: this.alfabetoBase = 'ABCDEFGHIKLMNOPQRSTVXYZabcdefghiklmnopqrstuvxyz'; break;
      case 4:
        this.esAscii = true;
        let ascii = '';
        for (let i = 32; i <= 126; i++) ascii += String.fromCharCode(i);
        this.alfabetoBase = ascii;
        break;
      case 5: this.alfabetoBase = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz0123456789 '; break;
    }
    this.procesarTexto();
  }
  /* [8] */
  async copiarTexto() {
    if (this.textoSalida) {
      await navigator.clipboard.writeText(this.textoSalida);
    }
  }

  /* [9] */
  private readonly FRECUENCIAS_ES: { [key: string]: number } = {
    ' ': 0.180,
    'E': 0.1315,
    'A': 0.1152,
    'O': 0.0862,
    'S': 0.0712,
    'R': 0.0647,
    'N': 0.0654,
    'I': 0.0625,
    'D': 0.0586,
    'L': 0.0497,
    'C': 0.0456,
    'T': 0.0431,
    'U': 0.0367,
    'M': 0.0295,
    'P': 0.0276,
    'B': 0.0142,
    'G': 0.0126,
    'V': 0.0105,
    'Y': 0.0097,
    'Q': 0.0087,
    'H': 0.0068,
    'F': 0.0065,
    'Z': 0.0052,
    'J': 0.0044,
    'Ñ': 0.0029,
    'X': 0.0022,
    'K': 0.0002,
    'W': 0.0001
  };

  /* [10] */
  ejecutarAlKindi() {
    if (!this.textoEntrada || this.moduloActivo !== 'CESAR') {
      this.analisisAlKindi = "> ERROR: Se requiere texto cifrado en modo CESAR para analizar.";
      return;
    }

    const textoATrabajar = this.textoEntrada;
    const N = this.alfabetoBase.length;

    if (N === 0) {
      this.analisisAlKindi = "> ERROR: Alfabeto vacío.";
      return;
    }

    /* [10.2] */
    const frecObs = new Array(N).fill(0);
    let totalValidos = 0;
    for (const char of textoATrabajar) {
      const idx = this.alfabetoBase.indexOf(char);
      if (idx !== -1) {
        frecObs[idx]++;
        totalValidos++;
      }
    }

    if (totalValidos === 0) {
      this.analisisAlKindi = "> ERROR: No hay caracteres válidos en el texto.";
      return;
    }

    /* [10.3] */
    const frecObsNorm = frecObs.map(v => v / totalValidos);

    /* [10.4] */
    const frecEsp = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      const char = this.alfabetoBase[i];
      const charFrecuencia = char.toUpperCase();

      if (this.FRECUENCIAS_ES.hasOwnProperty(charFrecuencia)) {
        frecEsp[i] = this.FRECUENCIAS_ES[charFrecuencia];
      } else {
        frecEsp[i] = 0;
      }
    }

    /* [10.5] */
    const sumaEsp = frecEsp.reduce((a, b) => a + b, 0);
    if (sumaEsp > 0) {
      for (let i = 0; i < N; i++) frecEsp[i] /= sumaEsp;
    }

    /* [10.6] */
    let mejorShift = 0;
    let menorDiferencia = Infinity;
    const diferencias: number[] = [];

    for (let shift = 0; shift < N; shift++) {
      let diff = 0;
      for (let j = 0; j < N; j++) {
        const obsIdx = (j + shift) % N;
        diff += Math.abs(frecEsp[j] - frecObsNorm[obsIdx]);
      }
      diferencias.push(diff);
      if (diff < menorDiferencia) {
        menorDiferencia = diff;
        mejorShift = shift % N;
      }
    }

    // // /* [10.7] */
    // this.analisisAlKindi = `> ANÁLISIS DE FRECUENCIAS COMPLETADO:\n` +
    //   `> Desplazamiento más probable: ${mejorShift % N} (diferencia L1 = ${menorDiferencia.toFixed(4)})\n` +
    //   `> Forzando descifrado con ese valor...`;

    // this.desplazamientoCesar = mejorShift;
    // this.operacion = 'DESCIFRAR';
    // this.procesarTexto();
    
    /* [10.7] Modificado */
    const ranking = diferencias
      .map((diff, index) => ({ shift: index, error: diff }))
      .sort((a, b) => a.error - b.error);

    const topCandidatos = ranking.slice(0, 5);

    let tablaResultados = "> TOP 5 CANDIDATOS (Menor error L1):\n";
    topCandidatos.forEach((c, i) => {
      tablaResultados += `> ${i + 1}. Shift: ${c.shift} | Error: ${c.error.toFixed(4)}\n`;
    });

    this.analisisAlKindi = `> ANÁLISIS DE FRECUENCIAS COMPLETADO\n` +
      `${tablaResultados}` +
      `> \n> Aplicando el candidato más probable (Shift ${mejorShift})...`;

    this.desplazamientoCesar = mejorShift;
    this.operacion = 'DESCIFRAR';
    this.procesarTexto();
  }

  /* [11] */
  ejecutarAtbashDecrypt() {
    this.analisisAlKindi = "> ATBASH: No se requiere análisis de frecuencias. El descifrado se aplica automáticamente al introducir el texto.";
    this.procesarTexto();
  }

}
