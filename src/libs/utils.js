const PromiseProvider = require("./promiseProvider");

const wrapCallback = function(callback) {
  if (callback == null) {
    return callback;
  }
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function, got ' + callback);
  }
  return function() {
    try {
      callback.apply(null, arguments);
    } catch (error) {
      process.nextTick(() => {
        throw error;
      });
    }
  };
};

function promiseOrCallback(callback, fn) {
  if (typeof callback === 'function') {
    return fn(function(error) {
      if (error != null) {
        try {
          callback(error);
        } catch (error) {
          return process.nextTick(() => {
            throw error;
          });
        }
        return;
      }
      callback.apply(this, arguments);
    });
  }

  const Promise = PromiseProvider.get();

  return new Promise((resolve, reject) => {
    fn(function(error, res) {
      if (error != null) {
        return reject(error);
      }
      if (arguments.length > 2) {
        return resolve(Array.prototype.slice.call(arguments, 1));
      }
      resolve(res);
    });
  });
};

// function add(ok, callback) {
//   callback && (callback = wrapCallback(callback));
//   return promiseOrCallback(callback, cb => {
//     console.log("add cb:" + cb);
//     if (ok) {
//       cb(null, "success");
//     } else {
//       cb("failed");
//     }
//   });
// }

// add(true, (err, result) => {
//   console.log(err);
//   console.log(result);
// });
// add(false, (err, result) => {
//   console.log(err);
//   console.log(result);
// });

// async function test() {
//   try {
//     await add(true);
//     await add(false);
//   } catch (err) {
//     console.log(err);
//   }
// }
// test();
exports.wrapCallback = wrapCallback;
exports.promiseOrCallback = promiseOrCallback;