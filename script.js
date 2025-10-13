//Chave para identificar os daddos salvos pela nossa aplicação
const STORAGE_KEY = "prompts_storage"

//Estado carregar os prompts salvos e exibir
const state = {
  prompts: [],
  selectedId: null,
}

// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hastext = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hastext)
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })
  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    alert("Título e conteúdo não podem estar vazios.")
    return
  }

  if (state.selectedId) {
    // Editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    // Criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    }
    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }
  renderList(elements.search.value)
  persist()
  alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Erro ao salvar no localStorage", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.log("Erro ao carregar do localStorage:", error)
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement("div")
  tmp.innerHTML = prompt.content

  return `
     <li class="prompt-item" data-id="${prompt.id}" data-action="select">
     <div class="prompt-item-content">
       <span class="prompt-item-title">${prompt.title}</span>
       <span class="prompt-item-description">${tmp.textContent}</span>
     </div>
     <button class="btn-icon" title="Remover" data-action="remove">
      <img class="icon icon-trash" src="./assets/remove.svg" alt="Remover" />
   </li>
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent
    navigator.clipboard.writeText(content.innerText)
    alert("Conteúdo copiado para área de trasferência!")
  } catch (error) {
    console.log("Erro ao copiar para a área de trasferência", error)
  }
}

// Evento dos botoes
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }

  if (item.getAttribute("data-action") === "select") {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content // Corrigido para innerHTML
      updateAllEditableStates()
    }
  }
})

// Função para abrir a sidebar
function openSidebar() {
  const sidebar = document.querySelector(".sidebar")
  if (sidebar) {
    sidebar.style.display = "block"
    elements.btnOpen.style.display = "none"
  }
}

// Função para fechar a sidebar
function closeSidebar() {
  const sidebar = document.querySelector(".sidebar")
  if (sidebar) {
    sidebar.style.display = "none"
    elements.btnOpen.style.display = "block"
  }
}

function attachSidebarHandlers() {
  if (elements.btnOpen) {
    elements.btnOpen.addEventListener("click", openSidebar)
  }
  if (elements.btnCollapse) {
    elements.btnCollapse.addEventListener("click", closeSidebar)
  }
}

// Função de inicialização
function init() {
  load()
  renderList("")
  updateAllEditableStates()
  attachAllEditableHandlers()
  // Inicialmente, sidebar visível e botão de abrir oculto
  const sidebar = document.querySelector(".sidebar")
  if (sidebar) {
    sidebar.style.display = "block"
    elements.btnOpen.style.display = "none"
  }
  attachSidebarHandlers()
}
// Executa a inicialização ao carregar o script
init()
