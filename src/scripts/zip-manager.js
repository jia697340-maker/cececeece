/**
 * 粘人精 - 压缩包处理模块
 * 负责解析 zip 文件，提供 UI 供用户选择需要导入的文件，并将选中的文件转化为 File 对象返回
 */

class ZipManager {
    constructor() {
        this.modal = document.getElementById('zip-selection-modal');
        this.fileListContainer = document.getElementById('zip-file-list');
        this.selectAllCheckbox = document.getElementById('zip-modal-select-all');
        this.countSpan = document.getElementById('zip-modal-count');
        this.btnConfirm = document.getElementById('zip-modal-confirm');
        this.btnCancel = document.getElementById('zip-modal-cancel');
        this.btnCancelIcon = document.getElementById('zip-modal-cancel-icon');
        
        this.currentZipFiles = []; // 存储当前解析出的 zip 内文件信息
        this.resolvePromise = null;
        this.rejectPromise = null;

        this.initEvents();
    }

    initEvents() {
        if (!this.modal) return;

        // 关闭弹窗
        const close = () => this.hideModal();
        this.btnCancel.addEventListener('click', close);
        this.btnCancelIcon.addEventListener('click', close);

        // 确认选择
        this.btnConfirm.addEventListener('click', async () => {
            const selectedItems = this.currentZipFiles.filter(item => item.checkbox.checked);
            if (selectedItems.length === 0) {
                alert('请至少选择一个文件');
                return;
            }

            try {
                this.btnConfirm.disabled = true;
                this.btnConfirm.querySelector('.btn-text').textContent = '处理中...';
                
                const files = [];
                for (const item of selectedItems) {
                    const blob = await item.zipEntry.async("blob");
                    // 构造 File 对象，以适配原有的文件处理逻辑
                    const file = new File([blob], item.name, { type: blob.type || 'application/octet-stream' });
                    files.push(file);
                }

                if (this.resolvePromise) {
                    this.resolvePromise(files);
                }
            } catch (error) {
                console.error("ZIP 文件处理失败:", error);
                if (this.rejectPromise) {
                    this.rejectPromise(error);
                }
            } finally {
                this.hideModal();
            }
        });

        // 全选/取消全选
        this.selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            this.currentZipFiles.forEach(item => {
                item.checkbox.checked = isChecked;
            });
            this.updateSelectionCount();
        });
    }

    /**
     * 更新已选数量显示
     */
    updateSelectionCount() {
        const selectedCount = this.currentZipFiles.filter(item => item.checkbox.checked).length;
        this.countSpan.textContent = `已选 ${selectedCount} / ${this.currentZipFiles.length} 项`;
        
        // 更新全选框状态
        if (selectedCount === 0) {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = false;
        } else if (selectedCount === this.currentZipFiles.length) {
            this.selectAllCheckbox.checked = true;
            this.selectAllCheckbox.indeterminate = false;
        } else {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = true;
        }
    }

    /**
     * 解析单个 ZIP 文件，并弹出选择界面
     * @param {File} file - 用户选择的 zip 文件
     * @returns {Promise<File[]>} - 用户确认后返回选中的 File 对象数组
     */
    async processZipFile(file) {
        return new Promise(async (resolve, reject) => {
            if (!window.JSZip) {
                reject(new Error("JSZip 库未加载"));
                return;
            }

            this.resolvePromise = resolve;
            this.rejectPromise = reject;
            this.currentZipFiles = [];
            this.fileListContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-color-secondary);">正在解析压缩包...</div>';
            
            this.showModal();

            try {
                const zip = new JSZip();
                const zipContent = await zip.loadAsync(file);
                
                this.fileListContainer.innerHTML = ''; // 清空加载提示
                
                // 过滤掉目录和隐藏文件（如 Mac 下的 __MACOSX 等）
                zipContent.forEach((relativePath, zipEntry) => {
                    if (!zipEntry.dir && !relativePath.startsWith('__MACOSX') && !relativePath.split('/').pop().startsWith('.')) {
                        const filename = relativePath.split('/').pop();
                        this.currentZipFiles.push({
                            name: filename,
                            fullPath: relativePath,
                            zipEntry: zipEntry,
                            checkbox: null // 将在渲染时绑定
                        });
                    }
                });

                if (this.currentZipFiles.length === 0) {
                    this.fileListContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-color-secondary);">压缩包内没有可识别的文件</div>';
                    this.selectAllCheckbox.disabled = true;
                    this.btnConfirm.disabled = true;
                    return;
                }

                // 渲染文件列表
                this.currentZipFiles.forEach((item, index) => {
                    const row = document.createElement('label');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '10px';
                    row.style.padding = '8px';
                    row.style.borderRadius = '6px';
                    row.style.cursor = 'pointer';
                    row.style.transition = 'background-color 0.2s';
                    
                    row.addEventListener('mouseover', () => row.style.backgroundColor = 'var(--bg-color)');
                    row.addEventListener('mouseout', () => row.style.backgroundColor = 'transparent');

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = true; // 默认全选
                    checkbox.addEventListener('change', () => this.updateSelectionCount());
                    item.checkbox = checkbox;

                    const icon = document.createElement('i');
                    icon.className = this.getFileIconClass(item.name);
                    icon.style.fontSize = '20px';
                    icon.style.color = 'var(--text-color-secondary)';

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = item.name;
                    nameSpan.style.flex = '1';
                    nameSpan.style.fontSize = '14px';
                    nameSpan.style.color = 'var(--text-color)';
                    nameSpan.style.whiteSpace = 'nowrap';
                    nameSpan.style.overflow = 'hidden';
                    nameSpan.style.textOverflow = 'ellipsis';

                    row.appendChild(checkbox);
                    row.appendChild(icon);
                    row.appendChild(nameSpan);
                    this.fileListContainer.appendChild(row);
                });

                this.selectAllCheckbox.disabled = false;
                this.selectAllCheckbox.checked = true;
                this.btnConfirm.disabled = false;
                this.updateSelectionCount();

            } catch (error) {
                console.error("解压失败:", error);
                this.fileListContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--danger-color);">解析失败: ${error.message}</div>`;
                this.btnConfirm.disabled = true;
            }
        });
    }

    /**
     * 根据文件名返回对应的 Phosphor 图标类名
     */
    getFileIconClass(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'txt': return 'ph ph-file-text';
            case 'doc':
            case 'docx': return 'ph ph-file-doc';
            case 'json': return 'ph ph-file-code';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp': return 'ph ph-image';
            default: return 'ph ph-file';
        }
    }

    showModal() {
        if (!this.modal) return;
        this.modal.classList.add('active');
        this.btnConfirm.querySelector('.btn-text').textContent = '确认导入';
    }

    hideModal() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        if (this.rejectPromise && !this.btnConfirm.disabled) { // 如果不是点击确认导致的隐藏，则视为取消
            this.rejectPromise(new Error("用户取消了操作"));
        }
        this.resolvePromise = null;
        this.rejectPromise = null;
    }
}

// 暴露为全局单例
window.zipManager = new ZipManager();
