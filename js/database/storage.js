export class StorageEngine {
  constructor() {
    this.dbName = 'FinancasDB';
    this.version = 3;
    this.db = null;
    this.cryptoKey = null;
  }

  async init(pin = null) {
    await this.setupCrypto(pin);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        const stores = ['contas', 'transacoes', 'despesas', 'cartoes', 'parcelamentos', 'metas', 'investimentos', 'assinaturas', 'configuracoes'];
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const options = storeName === 'configuracoes' ? { keyPath: 'chave' } : { keyPath: 'id', autoIncrement: true };
            db.createObjectStore(storeName, options);
          }
        });
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => reject(e.target.error);
    });
  }

  async setupCrypto(pin) {
    const salt = new TextEncoder().encode('FinancasLocalSaltString');
    const basePayload = pin ? pin : 'DefaultSystemEntropyKey123*';
    const passwordBuffer = new TextEncoder().encode(basePayload);
    
    const importedKey = await crypto.subtle.importKey(
      'raw', passwordBuffer, { name: 'PBKDF2' }, false, ['deriveKey']
    );
    
    this.cryptoKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, this.cryptoKey, encoded
    );
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext))
    };
  }

  async decrypt(encryptedObj) {
    try {
      const iv = new Uint8Array(encryptedObj.iv);
      const data = new Uint8Array(encryptedObj.data);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, this.cryptoKey, data
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (err) {
      throw new Error('Falha na decodificação dos dados. PIN inválido ou corrompido.');
    }
  }

  getAll(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = async () => {
          try {
            const result = [];
            for (const item of request.result) {
              if (storeName === 'configuracoes') {
                result.push(item);
              } else {
                const decrypted = await this.decrypt(item.payload);
                result.push({ id: item.id, ...decrypted });
              }
            }
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };
        request.onerror = () => reject(request.error);
      } catch (err) {
        resolve([]);
      }
    });
  }

  save(storeName, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const id = data.id;
        const dataToEncrypt = { ...data };
        delete dataToEncrypt.id;

        const encryptedPayload = await this.encrypt(dataToEncrypt);
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const record = id ? { id, payload: encryptedPayload } : { payload: encryptedPayload };
        const request = store.put(record);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(Number(id));

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}