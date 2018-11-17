import * as toSnakeCase from 'to-snake-case';
import * as FileSaver from 'file-saver';
import * as commentRegex from 'comment-regex';
import is_electron from './is_electron';
const curlup = require('curlup');
const fileDialog = require('file-dialog');

/**
 * Download the specified data with the provided options
 * @param data data string to download
 * @param fileName name of downloaded file
 * @param opts configuration options
 */
export const downloadData = (data, fileName = 'data', opts = undefined) => {
  let _opts = {
    mimeType: 'text/plain',
    dataUriAttr: 'text/plain;charset=utf-8',
    fileType: 'txt'
  };

  if (opts) {
    _opts = { ..._opts, ...opts };
  }

  const dataStr = `data:${_opts.dataUriAttr},${data}`;
  const fileNameWithExt = `${toSnakeCase(fileName)}.${_opts.fileType}`;
  const fileBlob = new Blob([data], {type: _opts.dataUriAttr});
  FileSaver.saveAs(fileBlob, fileNameWithExt);
};

/**
 * Download an object as a JSON file
 * @param obj The object to be downloaded
 * @param fileName The name the file will be called
 */
export const downloadJson = (obj, fileName = 'response', opts = undefined) => {
  let _opts = {
    mimeType: 'text/json',
    dataUriAttr: 'text/json;charset=utf-8',
    fileType: 'json'
  };

  if (opts) {
    _opts = { ..._opts, ...opts };
  }

  const dataStr = encodeURIComponent(JSON.stringify(obj));
  downloadData(dataStr, fileName, _opts);
};

/**
 * Get file data as string
 * @param files FileList object
 */
export const getFileStr = files => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function (e: any) {
      const contents: string = e.target.result;

      // Resolve file content
      resolve(contents);
    };
    fileReader.readAsText(files[0]);
  });
};

export const openFile = (...args) => {
  return fileDialog(...args).then(getFileStr).catch(err => {
    console.log('There was an issue while opening the file: ', err);
  });
}

export const parseCurlToObj = (...args) => curlup.parseCurl(...args);

export const isExtension = !!(window['chrome'] && window['chrome'].runtime && window['chrome'].runtime.id);
export const isFirefoxExtension = !!(window['chrome'] && window['chrome']['geckoProfiler']);

export const detectEnvironment = () => {
  if (is_electron) {
    return 'electron';
  }

  if (isExtension) {
    if (isFirefoxExtension) {
      return 'firefox-extension';
    } else {
      return 'chrome-extension'
    }
  }

  if (/http/.test(location.protocol)) {
    return 'web-app';
  }

  return 'other';
};

/**
 * Parse JSON with comments
 * @param str
 */
export const jsonc = (str: string) => {
  str = str.trim();
  str = str.replace(commentRegex(), '');

  if (!str) {
    return {};
  }
  return JSON.parse(str);
};
