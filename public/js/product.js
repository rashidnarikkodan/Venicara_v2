
const addImgDiv = document.getElementById('addImgDiv');
const imgInput = document.getElementById('imgInput');
const previewContainer = document.getElementById('previewContainer');

let selectedFiles = [];

addImgDiv.addEventListener('click', () => imgInput.click());

imgInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    if (!file.type.startsWith('image/')){
      showAlert('error',"Images are only allowed (eg:- .jpg, .png)")
      return
    };
    selectedFiles.push(file);
    const index = selectedFiles.length - 1;
    const reader = new FileReader();
    reader.onload = () => {
      // Wrapper
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('relative', 'rounded-2xl', 'overflow-hidden', 'w-32', 'h-32', 'shadow-md', 'border', 'border-gray-100', 'dark:border-white/5');
      imgWrapper.dataset.index = index;
      
      // Delete button
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.innerHTML = `<i class="fa-solid fa-trash-can text-[10px]"></i>`;
      removeBtn.classList.add('absolute', 'top-2', 'right-2', 'w-6', 'h-6', 'bg-red-500', 'text-white', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'hover:bg-red-600', 'transition-colors', 'z-10');
      removeBtn.onclick = () => {
        const i = parseInt(imgWrapper.dataset.index, 10);
        selectedFiles[i] = null; // mark deleted
        imgWrapper.remove();
      };
      
      // Image
      const img = document.createElement('img');
      img.src = reader.result;
      img.alt = 'preview';
      img.classList.add('w-full', 'h-full', 'object-cover');
      
      // Append
      imgWrapper.appendChild(removeBtn);
      imgWrapper.appendChild(img);
      previewContainer.appendChild(imgWrapper);
    };
    reader.readAsDataURL(file);
  });
  imgInput.value = '';
});

function getFinalFiles() {
  return selectedFiles.filter(f => f !== null);
}


function addVariant(container) {
  const variantHTML = `
    <li class="p-6 bg-gray-50 dark:bg-luxury-black/40 rounded-2xl border border-gray-100 dark:border-white/5 relative group animate-fade-in-down mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Base Price (₹)</label>
          <input name="basePrice" type="number" class="w-full px-4 py-3 bg-white dark:bg-luxury-charcoal border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-gold-500 transition-all text-sm dark:text-white" placeholder="eg: 5000">
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Discount (%)</label>
          <input name="discount" type="number" class="w-full px-4 py-3 bg-white dark:bg-luxury-charcoal border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-gold-500 transition-all text-sm dark:text-white" placeholder="eg: 10">
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Stock</label>
          <input name="stock" type="number" class="w-full px-4 py-3 bg-white dark:bg-luxury-charcoal border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-gold-500 transition-all text-sm dark:text-white" placeholder="eg: 20">
        </div>
        <div class="relative">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Volume (ml)</label>
          <div class="flex items-center space-x-2">
            <input name="volume" type="text" class="flex-1 px-4 py-3 bg-white dark:bg-luxury-charcoal border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-gold-500 transition-all text-sm dark:text-white" placeholder="eg: 100">
            <button type="button" class="delete-variant-btn p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
              <i class="fa-solid fa-trash-can pointer-events-none"></i>
            </button>
          </div>
        </div>
      </div>
    </li>
  `;
  container.insertAdjacentHTML('beforeend', variantHTML);
}

