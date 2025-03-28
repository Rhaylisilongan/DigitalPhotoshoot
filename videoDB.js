// videoDB.js
class VideoDB {
  constructor() {
    this.dbName = 'PhotoboothVideoDB';
    this.storeName = 'Videos';
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(`Error opening DB: ${event.target.error}`);
      };
    });
  }

  async saveVideo(videoBlob) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.add({ 
        video: videoBlob, 
        timestamp: Date.now(),
        type: 'video/webm'
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error saving video');
    });
  }

  async getAllVideos() {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching videos');
    });
  }
}

window.videoDB = new VideoDB();
