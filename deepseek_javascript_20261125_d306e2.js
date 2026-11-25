import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- 1. CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCy1MZmMjtGEH3nNfjce4UUfr_qgGgEXZU",
  authDomain: "tccluxury-3e35b.firebaseapp.com",
  projectId: "tccluxury-3e35b",
  storageBucket: "tccluxury-3e35b.firebasestorage.app",
  messagingSenderId: "535877150161",
  appId: "1:535877150161:web:2debf50c4691ef9e616cf0",
  measurementId: "G-NM1ZGKPMYK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos do DOM
const tabela = document.getElementById("tabelaCarros");
const catalogo = document.getElementById("catalogoCarros");
let idEditando = null;

// --- 2. FUNÇÃO PARA LER OS DADOS (READ) ---
async function carregarDados() {
    tabela.innerHTML = "";
    catalogo.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "carros"));

    querySnapshot.forEach((doc) => {
        const carro = doc.data();
        const id = doc.id;

        // Adiciona na Tabela do Admin
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${carro.marca}</td>
            <td>${carro.modelo}</td>
            <td>${carro.ano}</td>
            <td>R$ ${carro.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>
                <button class="btn btn-sm btn-warning btn-editar" 
                    data-id="${id}" 
                    data-marca="${carro.marca}" 
                    data-modelo="${carro.modelo}" 
                    data-ano="${carro.ano}" 
                    data-preco="${carro.preco}" 
                    data-categoria="${carro.categoria}">Editar</button>
                <button class="btn btn-sm btn-danger btn-excluir" data-id="${id}">Excluir</button>
            </td>
        `;
        tabela.appendChild(tr);

        // Adiciona no Catálogo de Cards
        const card = document.createElement("div");
        card.className = "car-card";
        card.innerHTML = `
            <div class="car-brand">${carro.marca} — ${carro.categoria}</div>
            <div class="car-model">${carro.modelo}</div>
            <div class="car-year">Ano: ${carro.ano}</div>
            <div class="car-price">R$ ${carro.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
        `;
        catalogo.appendChild(card);
    });
}

// --- 3. FUNÇÃO PARA ENVIAR DADOS (CREATE) ---
document.getElementById("carForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const marca = document.getElementById("marca").value;
    const modelo = document.getElementById("modelo").value;
    const ano = parseInt(document.getElementById("ano").value);
    const preco = parseFloat(document.getElementById("preco").value);
    const categoria = document.getElementById("categoria").value;

    try {
        await addDoc(collection(db, "carros"), { marca, modelo, ano, preco, categoria });
        alert("Carro cadastrado com sucesso!");
        document.getElementById("carForm").reset();
        carregarDados(); // Recarrega a tela sem precisar dar F5
    } catch (error) {
        console.error("Erro ao cadastrar: ", error);
        alert("Erro ao cadastrar. Verifique o console.");
    }
});

// --- 4. FUNÇÃO PARA ABRIR O MODAL DE EDIÇÃO ---
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-editar")) {
        const btn = e.target;
        idEditando = btn.dataset.id;

        document.getElementById("editarMarca").value = btn.dataset.marca;
        document.getElementById("editarModelo").value = btn.dataset.modelo;
        document.getElementById("editarAno").value = btn.dataset.ano;
        document.getElementById("editarPreco").value = btn.dataset.preco;
        document.getElementById("editarCategoria").value = btn.dataset.categoria;

        const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
        modal.show();
    }
});

// --- 5. FUNÇÃO PARA SALVAR EDIÇÃO (UPDATE) ---
document.getElementById("editarForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!idEditando) return;

    const marca = document.getElementById("editarMarca").value;
    const modelo = document.getElementById("editarModelo").value;
    const ano = parseInt(document.getElementById("editarAno").value);
    const preco = parseFloat(document.getElementById("editarPreco").value);
    const categoria = document.getElementById("editarCategoria").value;

    try {
        const carroRef = doc(db, "carros", idEditando);
        await updateDoc(carroRef, { marca, modelo, ano, preco, categoria });
        
        alert("Carro atualizado com sucesso!");
        bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
        carregarDados(); // Atualiza a tela
    } catch (error) {
        console.error("Erro ao editar: ", error);
    }
});

// --- 6. FUNÇÃO PARA EXCLUIR (DELETE) ---
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-excluir")) {
        const id = e.target.dataset.id;
        
        if (!confirm("Tem certeza que deseja excluir este veículo?")) return;

        try {
            await deleteDoc(doc(db, "carros", id));
            alert("Veículo excluído!");
            carregarDados(); // Atualiza a tela
        } catch (error) {
            console.error("Erro ao excluir: ", error);
        }
    }
});

// --- 7. INICIALIZA A LEITURA QUANDO A PÁGINA CARREGAR ---
carregarDados();