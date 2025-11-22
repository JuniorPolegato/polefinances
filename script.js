document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const langToggle = document.getElementById('langToggle');
    const resultsCount = document.getElementById('resultsCount');
    const addResourceBtn = document.getElementById('addResourceBtn');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const myCardsBtn = document.getElementById('myCardsBtn');
    const myCardsDropdown = document.getElementById('myCardsDropdown');
    const sortBtn = document.getElementById('sortBtn');
    const sortDropdown = document.getElementById('sortDropdown');

    const importFileInput = document.getElementById('importFileInput');
    const confirmModal = document.getElementById('confirmModal');
    const confirmRememberContainer = document.getElementById('confirmRememberContainer');
    const confirmRememberCheckbox = document.getElementById('confirmRememberCheckbox');
    const confirmRememberLabel = document.getElementById('confirmRememberLabel');
    const infoModal = document.getElementById('infoModal');
    const infoModalTitle = document.getElementById('infoModalTitle');
    const infoModalText = document.getElementById('infoModalText');
    const infoOkBtn = document.getElementById('infoOkBtn');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalText = document.getElementById('confirmModalText');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmNoBtn = document.getElementById('confirmNoBtn');

    const modal = document.getElementById('addResourceModal');
    const closeModalBtn = document.querySelector('.close-button');
    const cancelBtn = document.getElementById('cancelBtn');
    const addResourceForm = document.getElementById('addResourceForm');
    const formTitle = document.getElementById('formTitle');
    const formDescription = document.getElementById('formDescription');
    const formUrl = document.getElementById('formUrl');
    const formType = document.getElementById('formType');
    const formTags = document.getElementById('formTags');
    let currentEditId = null; // To track which resource is being edited
    const body = document.body;
    let currentLang = body.getAttribute('data-lang');
    let allResources = [];
    let currentSort = 'newest'; // Default sort order
    let fuse; // To hold the Fuse.js instance
    const STORAGE_KEY_PREFIX = 'polefinances_';

    // Static text translations for the UI elements
    const translations = {
        'en-US': {
            pageTitle: 'Modern Personal Finance Resources 💰',
            heroTitle: 'Master Your Money Journey',
            heroSubtitle: 'Curated resources for personal finance success.',
            searchPlaceholder: "Search for 'budgeting', 'crypto', 'retirement'...",
            initialTitle: '🔍 Start your search!',
            initialText: 'Type a keyword above to find relevant resources in our curated library.',
            noResultsTitle: '😔 No Results Found',
            noResultsText: 'Try a different keyword or broaden your search terms.',
            errorTitle: '🚨 Error Loading Data',
            errorText: 'Could not load the personal finance resources. Please check the JSON files.',
            footerText: '&copy; 2025 Personal Finance Hub. Knowledge is Power.',
            buttonText: 'PT-BR',
            buttonFlag: '🇧🇷',
            addResource: 'Add Resource +',
            modalTitle: 'Add New Resource',
            modalEditTitle: 'Edit Resource',
            saveButton: 'Save',
            myCardsMenu: 'My Cards ▾',
            shareEmail: 'Share via Email',
            shareWhatsapp: 'Share on WhatsApp',
            shareTelegram: 'Share on Telegram',
            importJSON: 'Import Cards',
            exportJSON: 'Export Cards',
            sortMenu: 'Sort by ▾',
            sortByTitle: 'Title',
            sortByNewest: 'Newest',
            sortByOldest: 'Oldest',
            updateButton: 'Update',
            infoModalTitle: 'Information',
            rememberChoice: 'Remember my choice for subsequent questions',
            viewResource: 'View Resource',
            importConfirmAdd: (title) => `A new card titled "${title}" was found. Do you want to add it?`,
            importConfirmUpdate: (title) => `A card titled "${title}" already exists. Do you want to update it with the imported data?`,
            importComplete: 'Import process finished.',
            importConfirm: 'This will replace all your current cards with the imported ones. Are you sure?',
            backToTop: 'Go to top',
            deleteConfirm: 'Are you sure you want to delete this resource?',
            resultsFound: (count) => `${count} ${count === 1 ? 'result' : 'results'} found.`,
            buttonAria: 'Toggle language to Portuguese'
        },
        'pt-BR': {
            pageTitle: 'Recursos Modernos de Finanças Pessoais 💰',
            heroTitle: 'Domine Sua Jornada Financeira',
            heroSubtitle: 'Recursos selecionados para o sucesso financeiro pessoal.',
            searchPlaceholder: "Pesquise por 'orçamento', 'cripto', 'aposentadoria'...",
            initialTitle: '🔍 Comece sua busca!',
            initialText: 'Digite uma palavra-chave acima para encontrar recursos relevantes em nossa biblioteca.',
            noResultsTitle: '😔 Nenhum Resultado Encontrado',
            noResultsText: 'Tente uma palavra-chave diferente ou amplie seus termos de busca.',
            errorTitle: '🚨 Erro ao Carregar Dados',
            errorText: 'Não foi possível carregar os recursos de finanças pessoais. Verifique os arquivos JSON.',
            footerText: '&copy; 2025 Central de Finanças Pessoais. Conhecimento é Poder.',
            buttonText: 'EN-US',
            buttonFlag: '🇺🇸',
            addResource: 'Adicionar Recurso +',
            modalTitle: 'Adicionar Novo Recurso',
            modalEditTitle: 'Editar Recurso',
            saveButton: 'Salvar',
            myCardsMenu: 'Meus Cartões ▾',
            shareEmail: 'Compartilhar por E-mail',
            shareWhatsapp: 'Compartilhar no WhatsApp',
            shareTelegram: 'Compartilhar no Telegram',
            importJSON: 'Importar Cartões',
            exportJSON: 'Exportar Cartões',
            sortMenu: 'Ordenar por ▾',
            sortByTitle: 'Título',
            sortByNewest: 'Mais Recentes',
            sortByOldest: 'Mais Antigos',
            updateButton: 'Atualizar',
            infoModalTitle: 'Informação',
            rememberChoice: 'Lembrar minha escolha para as próximas perguntas',
            viewResource: 'Ver Recurso',
            importConfirmAdd: (title) => `Um novo cartão chamado "${title}" foi encontrado. Deseja adicioná-lo?`,
            importConfirmUpdate: (title) => `Um cartão chamado "${title}" já existe. Deseja atualizá-lo com os dados importados?`,
            importComplete: 'Processo de importação finalizado.',
            importConfirm: 'Isso substituirá todos os seus cartões atuais pelos importados. Tem certeza?',
            backToTop: 'Voltar ao topo',
            deleteConfirm: 'Tem certeza que deseja excluir este recurso?',
            resultsFound: (count) => `${count} ${count === 1 ? 'resultado encontrado' : 'resultados encontrados'}.`,
            buttonAria: 'Alternar idioma para Inglês Americano'
        }
    };

    // --- 1. Fetch Data based on Language ---
    const fetchData = async (lang) => {
        const file = lang === 'pt-BR' ? 'data_pt-BR.json' : 'data.json';
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const baseData = await response.json();

            // --- Local Storage Logic ---
            const storageKey = `${STORAGE_KEY_PREFIX}${lang}`;
            const storedData = JSON.parse(localStorage.getItem(storageKey)) || { added: [], deleted: [], edited: {} };

            // Add unique IDs to base data
            let combinedData = baseData.map((res, index) => ({
                ...res,
                // Create a stable ID based on content for base items
                id: `res-base-${index}`
            }));

            // Filter out deleted items
            combinedData = combinedData.filter(res => !storedData.deleted.includes(res.id));

            // Apply edits
            combinedData.forEach((res, index) => {
                if (storedData.edited[res.id]) {
                    combinedData[index] = { ...res, ...storedData.edited[res.id] };
                }
            });
            // Add newly created items
            // We give them IDs here if they don't have one, though our current logic always adds one.
            const addedData = storedData.added.map(res => ({ ...res, id: res.id || `res-${Date.now()}` }));
            allResources = [...addedData, ...combinedData];

            rebuildSearchIndex();
            // Trigger a display update with the fetched data
            displayResults(filterResources(searchInput.value), true);
        } catch (error) {
            console.error(`Could not fetch resources for ${lang}:`, error);
            const t = translations[currentLang];
            resultsContainer.innerHTML = `<div class="no-results"><h2>${t.errorTitle}</h2><p>${t.errorText}</p></div>`;
        }
    };

    // --- Helper to rebuild the search index ---
    const rebuildSearchIndex = () => {
        const options = {
            keys: ['title', 'description', 'tags', 'type'],
            includeScore: true,
            threshold: 0.4,
            ignoreLocation: true,
        };
        const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

        const searchableData = allResources.map(item => ({
            ...item,
            normalized: { ...item, title: normalize(item.title), description: normalize(item.description), type: normalize(item.type) }
        }));

        fuse = new Fuse(searchableData, { ...options, keys: ['normalized.title', 'normalized.description', 'normalized.tags', 'normalized.type'] });
    };

    // --- 2. UI Translation Function ---
    const updateUI = (lang) => {
        const t = translations[lang];

        document.getElementById('pageTitle').textContent = t.pageTitle;
        document.getElementById('heroTitle').textContent = t.heroTitle;
        document.getElementById('heroSubtitle').textContent = t.heroSubtitle;
        searchInput.placeholder = t.searchPlaceholder;
        document.getElementById('footerText').innerHTML = t.footerText;
        addResourceBtn.textContent = t.addResource;
        myCardsBtn.innerHTML = t.myCardsMenu;
        // Update dropdown items
        document.getElementById('shareEmail').textContent = t.shareEmail;
        document.getElementById('shareWhatsapp').textContent = t.shareWhatsapp;
        document.getElementById('shareTelegram').textContent = t.shareTelegram;
        document.getElementById('importJsonBtn').textContent = t.importJSON;
        document.getElementById('exportJsonBtn').textContent = t.exportJSON;
        sortBtn.innerHTML = t.sortMenu;
        document.getElementById('sortByTitle').textContent = t.sortByTitle;
        document.getElementById('sortByNewest').textContent = t.sortByNewest;
        document.getElementById('sortByOldest').textContent = t.sortByOldest;


        backToTopBtn.title = t.backToTop;
        document.getElementById('modalTitle').textContent = t.modalTitle;
        confirmRememberLabel.textContent = t.rememberChoice;
        infoModalTitle.textContent = t.infoModalTitle;

        langToggle.querySelector('.flag').textContent = t.buttonFlag;
        langToggle.innerHTML = `<span class="flag">${t.buttonFlag}</span> ${t.buttonText}`;
        langToggle.setAttribute('aria-label', t.buttonAria);

        // Ensure the initial/no-results message is also updated
        const isInitial = resultsContainer.querySelector('.initial-message');
        const isNoResults = resultsContainer.querySelector('.no-results');

        if (isInitial) {
            document.getElementById('initialTitle').textContent = t.initialTitle;
            document.getElementById('initialText').textContent = t.initialText;
        } else if (isNoResults) {
            // Re-display results to show the correct No Results message
            displayResults([], true);
        }

        body.setAttribute('data-lang', lang);
    };

    // --- 3. Filter Logic (No Change) ---
    const filterResources = (searchTerm) => {
        let results = [];
        const trimmedSearchTerm = searchTerm.trim();

        if (trimmedSearchTerm.length === 0) {
            results = allResources;
        } else {
            // Normalize the search term to remove accents
            const normalizedSearchTerm = trimmedSearchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            // Use Fuse.js to search and map the results back to the original items
            const fuseResults = fuse.search(normalizedSearchTerm);
            results = fuseResults.map(result => result.item);
        }

        // Apply sorting
        if (currentSort === 'title') {
            results.sort((a, b) => a.title.localeCompare(b.title));
        } else if (currentSort === 'newest') {
            results.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        } else if (currentSort === 'oldest') {
            results.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
        }

        return results;
    };

    // --- 4. Display Results (Rendering) ---
    const displayResults = (results, forceUpdate = false) => {
        const t = translations[currentLang];
        resultsContainer.innerHTML = ''; // Clear previous results
        resultsCount.textContent = ''; // Clear count

        if (results.length === 0) {
            // Show Initial or No Results message based on input
            // Don't show count if there are no results
            const isSearchEmpty = searchInput.value.trim() === '';
            const msgTitle = isSearchEmpty ? t.initialTitle : t.noResultsTitle;
            const msgText = isSearchEmpty ? t.initialText : t.noResultsText;
            const msgClass = isSearchEmpty ? 'initial-message' : 'no-results';

            resultsContainer.innerHTML = `
                <div class="${msgClass}">
                    <h2 ${isSearchEmpty ? 'id="initialTitle"' : ''}>${msgTitle}</h2>
                    <p ${isSearchEmpty ? 'id="initialText"' : ''}>${msgText}</p>
                </div>`;
            return;
        }

        // Update and show the results count.
        resultsCount.textContent = t.resultsFound(results.length);

        // Render and apply staggered animation
        results.forEach((resource, index) => {
            const card = document.createElement('div');
            card.classList.add('result-card');

            // Set a CSS variable for staggered animation delay
            card.style.setProperty('--animation-delay', `${index * 0.05}s`);

            const tagsHtml = resource.tags ? resource.tags.map(tag => `<span>${tag}</span>`).join('') : '';
            const formattedDate = new Date(resource.lastUpdated).toLocaleString(currentLang, { dateStyle: 'short', timeStyle: 'short' });

            card.innerHTML = `
                <button class="delete-button" data-id="${resource.id}" title="Delete resource">&times;</button>
                <button class="edit-button" data-id="${resource.id}" title="Edit resource">&#x21bb;</button>
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <div class="tags">${tagsHtml}</div>
                <a href="${resource.url}" target="_blank" rel="noopener noreferrer">${t.viewResource} (${resource.type})</a>
                <div class="last-updated" title="Last updated">
                    <span class="icon">&#128337;</span>
                    <span>${formattedDate}</span>
                </div>
            `;
            resultsContainer.appendChild(card);
        });

        // Add event listeners to the new delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDelete);
        });

        // Add event listeners to the new edit buttons
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', handleEdit);
        });
    };

    // --- 5. Event Listeners ---

    // Toggle Button Listener
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en-US' ? 'pt-BR' : 'en-US';
        searchInput.value = ''; // Clear search on language change
        updateUI(currentLang);
        fetchData(currentLang);
    });

    // Search Input Listener
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = searchInput.value;
            const filtered = filterResources(searchTerm);
            displayResults(filtered);
        }, 300); // Wait 300ms after the user stops typing
    });

    // --- Modal Logic ---
    const openModal = (editMode = false) => {
        const t = translations[currentLang];
        if (editMode) {
            document.getElementById('modalTitle').textContent = t.modalEditTitle;
            document.getElementById('saveBtn').textContent = t.updateButton;
        } else {
            document.getElementById('modalTitle').textContent = t.modalTitle;
            document.getElementById('saveBtn').textContent = t.saveButton;
            currentEditId = null; // Ensure we're not in edit mode
        }
        modal.style.display = 'block';
    };
    const closeModal = () => {
        modal.style.display = 'none';
        currentEditId = null;
        addResourceForm.reset();
    };

    addResourceBtn.addEventListener('click', () => {
        openModal(false); // Explicitly open in "add" mode
    });
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- "My Cards" Dropdown Logic ---
    myCardsBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent window click listener from closing it immediately
        myCardsDropdown.style.display = myCardsDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', () => {
        if (myCardsDropdown.style.display === 'block') {
            myCardsDropdown.style.display = 'none';
        }
    });

    // --- Sort Dropdown Logic ---
    sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.style.display = sortDropdown.style.display === 'block' ? 'none' : 'block';
    });

    sortDropdown.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.id === 'sortByTitle') {
            currentSort = 'title';
        } else if (e.target.id === 'sortByNewest') {
            currentSort = 'newest';
        } else if (e.target.id === 'sortByOldest') {
            currentSort = 'oldest';
        }
        // Re-filter and display results with the new sort order
        const filtered = filterResources(searchInput.value);
        displayResults(filtered);
        sortDropdown.style.display = 'none';
    });

    // Dropdown menu actions
    document.getElementById('exportJsonBtn').addEventListener('click', (e) => {
        e.preventDefault();
        exportDataAsJson(allResources, `polefinances_export_${currentLang}.json`);
    });

    document.getElementById('importJsonBtn').addEventListener('click', (e) => {
        e.preventDefault();
        importFileInput.click(); // Trigger hidden file input
    });

    document.getElementById('shareEmail').addEventListener('click', (e) => {
        e.preventDefault();
        shareViaEmail();
    });
    document.getElementById('shareWhatsapp').addEventListener('click', (e) => {
        e.preventDefault();
        shareViaWhatsApp();
    });
    document.getElementById('shareTelegram').addEventListener('click', (e) => {
        e.preventDefault();
        shareViaTelegram();
    });

    // --- Custom Confirmation Modal Logic ---
    const showConfirmModal = (title, text, showRememberOption = false) => {
        return new Promise((resolve) => {
            confirmModalTitle.textContent = title;
            confirmModalText.textContent = text;

            if (showRememberOption) {
                confirmRememberContainer.style.display = 'flex';
                confirmRememberCheckbox.checked = false; // Reset checkbox
            } else {
                confirmRememberContainer.style.display = 'none';
            }

            confirmModal.style.display = 'block';

            const closeAndResolve = (result) => {
                confirmModal.style.display = 'none';
                confirmYesBtn.removeEventListener('click', yesHandler);
                confirmNoBtn.removeEventListener('click', noHandler);
                resolve(result);
            };

            const yesHandler = () => {
                const remember = showRememberOption && confirmRememberCheckbox.checked;
                closeAndResolve({ confirmed: true, remember });
            };
            const noHandler = () => {
                const remember = showRememberOption && confirmRememberCheckbox.checked;
                closeAndResolve({ confirmed: false, remember });
            };

            confirmYesBtn.addEventListener('click', yesHandler);
            confirmNoBtn.addEventListener('click', noHandler);
        });
    };

    // --- Info Modal Logic ---
    const showInfoModal = (text) => {
        infoModalText.textContent = text;
        infoModal.style.display = 'block';
    };

    infoOkBtn.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });

    // --- Back to Top Logic ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    // --- Form Submission Logic ---
    addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const storageKey = `${STORAGE_KEY_PREFIX}${currentLang}`;
        const storedData = JSON.parse(localStorage.getItem(storageKey)) || { added: [], deleted: [], edited: {} };

        if (currentEditId) {
            // --- UPDATE LOGIC ---
            const resourceIndex = allResources.findIndex(res => res.id === currentEditId);
            if (resourceIndex > -1) {
                const updatedResource = {
                    ...allResources[resourceIndex],
                    title: formTitle.value,
                    description: formDescription.value,
                    url: formUrl.value,
                    type: formType.value,
                    lastUpdated: new Date().toISOString(),
                    tags: formTags.value.split(',').map(tag => tag.trim()).filter(Boolean)
                };
                allResources[resourceIndex] = updatedResource;

                // Save update to localStorage
                const addedIndex = storedData.added.findIndex(res => res.id === currentEditId);
                if (addedIndex > -1) {
                    // It was a user-added item, update it in the 'added' array
                    storedData.added[addedIndex] = updatedResource;
                } else {
                    // It was a base item, store the changes in the 'edited' object
                    storedData.edited[currentEditId] = updatedResource;
                }
            }
        } else {
            // --- ADD LOGIC ---
            const newResource = {
                id: `res-user-${Date.now()}`,
                title: formTitle.value,
                description: formDescription.value,
                url: formUrl.value,
                type: formType.value,
                lastUpdated: new Date().toISOString(),
                tags: formTags.value.split(',').map(tag => tag.trim()).filter(Boolean)
            };
            allResources.unshift(newResource);
            storedData.added.push(newResource);
        }

        localStorage.setItem(storageKey, JSON.stringify(storedData));

        // Rebuild search index with the new/updated data
        rebuildSearchIndex();

        // Re-display all results
        displayResults(filterResources(searchInput.value));
        closeModal();
    });

    // --- Edit Logic ---
    const handleEdit = (event) => {
        const resourceId = event.target.getAttribute('data-id');
        const resourceToEdit = allResources.find(res => res.id === resourceId);

        if (resourceToEdit) {
            currentEditId = resourceId;
            formTitle.value = resourceToEdit.title;
            formDescription.value = resourceToEdit.description;
            formUrl.value = resourceToEdit.url;
            formType.value = resourceToEdit.type;
            formTags.value = resourceToEdit.tags ? resourceToEdit.tags.join(', ') : '';
            openModal(true); // Open modal in edit mode
        }
    };

    // --- Delete Logic ---
    const handleDelete = (event) => {
        const t = translations[currentLang];
        const resourceId = event.target.getAttribute('data-id');

        // Prevent event from bubbling up to the card's link
        event.stopPropagation();

        // Confirmation dialog
        showConfirmModal(t.deleteConfirm, '').then(result => {
            if (!result.confirmed) return;

            // --- Save deletion to Local Storage ---
            const storageKey = `${STORAGE_KEY_PREFIX}${currentLang}`;
            const storedData = JSON.parse(localStorage.getItem(storageKey)) || { added: [], deleted: [], edited: {} };

            // Check if the item being deleted was one that was added locally
            const addedIndex = storedData.added.findIndex(res => res.id === resourceId);
            if (addedIndex > -1) {
                // If so, just remove it from the 'added' list
                storedData.added.splice(addedIndex, 1);
            } else {
                // Otherwise, it's a base item. Add its ID to the 'deleted' list.
                if (!storedData.deleted.includes(resourceId)) {
                    storedData.deleted.push(resourceId);
                }
                // Also remove it from the 'edited' list if it was there
                delete storedData.edited[resourceId];
            }
            localStorage.setItem(storageKey, JSON.stringify(storedData));

            // Find the index of the resource to delete
            const resourceIndex = allResources.findIndex(res => res.id === resourceId);

            if (resourceIndex > -1) {
                // Remove the resource from the array
                allResources.splice(resourceIndex, 1);

                // Rebuild search index after deletion
                rebuildSearchIndex();
                // Re-render the currently filtered view
                displayResults(filterResources(searchInput.value));
            }
        });
    };

    // --- Helper Function to Export Data ---
    const exportDataAsJson = (data, fileName) => {
        // Create a new array without the 'id' field for a cleaner export
        const dataToExport = data.map(({ id, ...rest }) => rest);
        const jsonString = JSON.stringify(dataToExport, null, 2); // Pretty print the JSON
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- Helper Function to Import Data ---
    importFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const t = translations[currentLang];
        const reader = new FileReader();
        let rememberAddChoice = null; // null, true, or false
        let rememberUpdateChoice = null; // null, true, or false

        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (!Array.isArray(importedData)) throw new Error("JSON is not an array.");

                const storageKey = `${STORAGE_KEY_PREFIX}${currentLang}`;
                const storedData = JSON.parse(localStorage.getItem(storageKey)) || { added: [], deleted: [], edited: {} };

                for (const importedCard of importedData) {
                    const existingCardIndex = allResources.findIndex(card => card.title.toLowerCase() === importedCard.title.toLowerCase());

                    if (existingCardIndex > -1) {
                        // Card exists, ask to update
                        let confirmed = rememberUpdateChoice;
                        if (confirmed === null) {
                            const result = await showConfirmModal('Confirmar Atualização', t.importConfirmUpdate(importedCard.title), true);
                            confirmed = result.confirmed;
                            if (result.remember) {
                                rememberUpdateChoice = result.confirmed;
                            }
                        }
                        if (confirmed) {
                            const existingCard = allResources[existingCardIndex];
                            const updatedCard = { ...existingCard, ...importedCard }; // Merge data, imported overwrites
                            allResources[existingCardIndex] = updatedCard;

                            // Update in localStorage
                            const addedIndex = storedData.added.findIndex(res => res.id === existingCard.id);
                            if (addedIndex > -1) {
                                storedData.added[addedIndex] = updatedCard;
                            } else {
                                storedData.edited[existingCard.id] = updatedCard;
                            }
                        }
                    } else {
                        // Card is new, ask to add
                        let confirmed = rememberAddChoice;
                        if (confirmed === null) {
                            const result = await showConfirmModal('Confirmar Adição', t.importConfirmAdd(importedCard.title), true);
                            confirmed = result.confirmed;
                            if (result.remember) {
                                rememberAddChoice = result.confirmed;
                            }
                        }
                        if (confirmed) {
                            const newCard = { ...importedCard, id: `res-user-${Date.now()}-${Math.random()}` };
                            allResources.unshift(newCard);
                            storedData.added.push(newCard);
                        }
                    }
                }

                // Save all accumulated changes to localStorage
                localStorage.setItem(storageKey, JSON.stringify(storedData));

                // Rebuild index and refresh UI
                rebuildSearchIndex();
                displayResults(filterResources(searchInput.value));
                showInfoModal(t.importComplete);

            } catch (error) {
                alert(`Error importing file: ${error.message}`);
            } finally {
                event.target.value = ''; // Reset file input
            }
        };

        reader.readAsText(file);
    });

    // --- Helper Functions for Sharing ---
    const generateShareText = () => {
        let text = "Confira minha lista de recursos de finanças:\n\n";
        allResources.slice(0, 5).forEach(res => { // Share first 5 as a sample
            text += `- ${res.title}\n`;
        });
        text += `\n... e muito mais! Veja em ${window.location.href}`;
        return encodeURIComponent(text);
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent("Meus Recursos de Finanças");
        const body = generateShareText();
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const shareViaWhatsApp = () => {
        const text = generateShareText();
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareViaTelegram = () => {
        const text = generateShareText();
        const url = encodeURIComponent(window.location.href);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    };

    // Start the process
    updateUI(currentLang);
    fetchData(currentLang);
});