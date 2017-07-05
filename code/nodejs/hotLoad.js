var Fs = require("fs");
var Path = require("path");
var _ = require("lodash");

var ReloadHandler = function () {
    this.dirList = [
        Path.join(__dirname, "../handler/"),
        Path.join(__dirname, "../lib/"),
        Path.join(__dirname, "../models/"),
        Path.join(__dirname, "../reports/"),
        Path.join(__dirname, "../routes/"),
        Path.join(__dirname, "../utils/")
    ];
    this.run();
};

ReloadHandler.getInstance = (function () {
    var inst = null;
    return function () {
        if (inst instanceof ReloadHandler) {
            return inst;
        }
        inst = new ReloadHandler();
        return inst;
    }
})();

ReloadHandler.prototype.run = function () {
    var self = this;
    Fs.watch(this.dirList[0], function (event, fileName) {
        fileChange(Path.join(self.dirList[0], "/", fileName));
    });
    Fs.watch(this.dirList[1], function (event, fileName) {
        fileChange(Path.join(self.dirList[1], "/", fileName));
    });
    Fs.watch(this.dirList[2], function (event, fileName) {
        fileChange(Path.join(self.dirList[2], "/", fileName));
    });
    Fs.watch(this.dirList[3], function (event, fileName) {
        fileChange(Path.join(self.dirList[3], "/", fileName));
    });
    Fs.watch(this.dirList[4], function (event, fileName) {
        fileChange(Path.join(self.dirList[4], "/", fileName));
    });
    Fs.watch(this.dirList[5], function (event, fileName) {
        fileChange(Path.join(self.dirList[5], "/", fileName));
    });
};

function invalidFile(fileName) {
    var ext = fileName.split(".");
    if (ext.length >= 2) {
        return ext[1] == "json" || ext[1] == "js";
    }
    return false;
}

function mainFile(fileName) {
    var ext = fileName.split(/\\|\//);
    if (ext.length >= 1) {
        return ext[ext.length - 1] == "app.js" || ext[ext.length - 1] == "cluster.js";
    }
    return false;
}

function fileChange(fileName) {
    if (invalidFile(fileName)) {
        var loadList = {};
        removeParentCache(require.cache[fileName], loadList);
        if (!_.isEmpty(loadList)) {
            for (var i in loadList) {
                if(!mainFile(i)){
                    delete require.cache[i];
                    require(i);
                }
            }
        }
    }
}

function removeParentCache(model, loadList) {
    if (model && model.parent) {
        if (model.filename && loadList[model.filename] == undefined) {
            loadList[model.filename] = 1;
        }
        removeParentCache(model.parent, loadList);
    } else {
        if (model && model.filename && loadList[model.filename] == undefined) {
            loadList[model.filename] = 1;
        }
    }
}

module.exports = ReloadHandler.getInstance();