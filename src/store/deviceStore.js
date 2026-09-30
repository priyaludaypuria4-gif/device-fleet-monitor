class DeviceStore {
  constructor() {
    this.devices = new Map();
  }

  create(device) {
    this.devices.set(device.id, device);
    return device;
  }

  findById(id) {
    return this.devices.get(id);
  }

  findAll() {
    return Array.from(this.devices.values());
  }

  update(id, updates) {
    const device = this.devices.get(id);

    if (!device) {
      return null;
    }

    const updatedDevice = {
      ...device,
      ...updates
    };

    this.devices.set(id, updatedDevice);

    return updatedDevice;
  }

  clear() {
    this.devices.clear();
  }
}

module.exports = new DeviceStore();
