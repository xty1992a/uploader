const $ = o => document.querySelector(o)
import Uploader from './package/main'
import * as API from './dev/api'
import 'core-js'

const btn = $('#btn')
const file = $('#file')

const uploader = new Uploader({
  el: btn,
  uploadUrl: 'http://up-z2.qiniup.com/',
  getFormDataAsync(callback, file) {
	API.getQiNiuToken()
		.then(res => {
		  console.log(res)
		  callback({
			key: 'demo/' + Date.now() + file.name,
			token: res.data.token,
		  })
		})
  },
})

uploader.on('upload', function (e) {
  console.log(e.data.path)
})

const uploader1 = new Uploader({
  el: file,
  uploadUrl: 'http://up-z2.qiniup.com/',
  getFormDataAsync(callback, file) {
	API.getQiNiuToken()
		.then(res => {
		  callback({
			key: 'demo/' + Date.now() + file.name,
			token: res.data.token,
		  })
		})
  },
})

uploader1.on('upload', function (e) {
  console.log(e.data.path)
})
