// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

export default class Browser {
  static isDev() {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  }

  public static persistentStorage() {
    if (this.isDev()) {
      return null;
    }
    return chrome.storage.local;
  }

  public static sessionStorage() {
    if (this.isDev()) {
      return null;
    }
    // chrome.storage.session is still waiting to get into the @types/chrome
    return ((chrome.storage as any).session);
  }

  public static tabs() {
    if (this.isDev()) {
      return null;
    }
    return chrome.tabs;
  }
}
