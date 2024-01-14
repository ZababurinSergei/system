import isEmpty from '../isEmpty/isEmpty.mjs'
import pushkin from './default/pushkin.index.mjs'
import { assert } from '../chai/index.mjs'
import { expect } from '../chai/index.mjs'
import { should } from '../chai/index.mjs'

let tests = Symbol.for("tests");

export default ( url = false ) => {
  return new Promise(async (resolve, reject) => {
      try {
          if(url) {
              window[tests] = {
                  assert: assert,
                  expect: expect,
                  should: should,
                  isEmpty: isEmpty
              }

              let script = document.createElement('script')
              script.type ='module'
              script.src = `${url}`
              document.body.appendChild(script)
              script.onload = () => {
                  resolve({
                      success: true,
                      status: "true",
                      message: ''
                  })
              }
              script.onerror = function(e) {
                  alert("Error loading " + this.src);
                  reject(e)
              };
          } else {
              eval(pushkin)
              resolve({
                  success: true,
                  status: "true",
                  message: ''
              })
          }
      } catch (e) {
          console.error(e)
          resolve({
              success: false,
              status: "not ok",
              message: e
          })
      }
  })
}
