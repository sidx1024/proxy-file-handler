const fs = require('fs');

const handler = {
  get: function (target, key) {
    if (fs.existsSync(key)) {
      return fs.readFileSync(target.path + '/' + key, 'utf8');
    } else {
      return createFileInterface(target.path + '/' + key);
    }
  },
  set: function (target, key, value) {
    try {
      fs.writeFileSync(target.path + '/' + key, value, 'utf8');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  ownKeys: function (target) {
    return fs.readdirSync(target.path);
  },
  deleteProperty(target, key) {
    try {
      const stat = fs.statSync(target.path + '/' + key);
      if (stat.isFile()) {
        fs.unlinkSync(target.path + '/' + key);
      } else if (stat.isDirectory()) {
        fs.rmdirSync(target.path + '/' + key, { recursive: true });
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};

function createFileInterface(path) {
  try {
    const stat = fs.statSync(path);
    if (stat.isFile()) {
      return fs.readFileSync(path, 'utf8');
    } else if (stat.isDirectory()) {
      // Directory already exists, do nothing.
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(path);
    } else {
      console.error(e);
    }
  }

  return new Proxy({ path }, handler);
}

const explorer = createFileInterface('./explorer');

explorer.first.second.third['file.txt'] = 'Hello there!';