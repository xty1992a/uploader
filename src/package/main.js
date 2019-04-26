import request from './request'

class EmitAble {
  task = {}

  on(event, callback) {
	this.task[event] = callback
  }

  fire(event, payload) {
	this.task[event] && this.task[event](payload)
  }
}

const defaultOptions = {
  uploadUrl: '/',
  fileName: 'file',
  stop: true,
  getFormData: void 0,
  responseFormat: o => o.data,
  deleteRequest: void 0,
  el: void 0,
};

export default class Uploader extends EmitAble {

  constructor(opt) {
	super();
	this.$options = {
	  ...defaultOptions,
	  ...opt,
	}

	this.bindEl()
  }

  bindEl() {
	let {el} = this.$options
	if (el instanceof Element) {
	  if (el.tagName.toLowerCase() === 'input' && el.type === 'file') {
		el.addEventListener('change', this.fileChangeHandler)
	  }
	  else {
		el.style.overflow = 'hidden';
		el.style.position = 'relative';
		el.appendChild(this.generateFile())
	  }
	}
  }

  generateFile() {
	let input = document.createElement('input')
	input.type = 'file'
	input.addEventListener('change', this.fileChangeHandler)
	input.style.position = 'absolute'
	input.style.left = 0
	input.style.right = 0
	input.style.top = 0
	input.style.bottom = 0
	input.style.width = '100%'
	input.style.height = '100%'
	input.style.opacity = 0
	// 阻止事件冒泡,防止点击事件被拦截掉
	if (this.$options.stop) {
	  input.addEventListener('click', function (e) {
		e.stopPropagation()
	  })
	}
	return input
  }

  // 提供给实例用于加载input的文件
  fileChangeHandler = (e) => {
	let files = e.target.files || e.dataTransfer.files
	if (!files.length) return false
	this.uploadFile(files[0])
  }

  uploadFile = (file) => {
	if (!file instanceof Blob) return
	this.uploadRequest(file)
		.then(res => {
		  this.fire('upload', res)
		})
		.catch(e => {
		  this.fire('upload-error', e)
		})
  }

  // 上传接口
  uploadRequest = (file) => new Promise((resolve, reject) => {
	if (this.$options.upload) {
	  this.$options.upload(file, (err, res) => {
		err ? reject(err) : resolve(res)
	  })
	}
	else {
	  // const form =  this.generateForm(img)
	  this.generateForm(file)
		  .then(form => {
			return request(this.$options.uploadUrl, form)
		  })
		  .then(res => {
			resolve({
			  ...res,
			  formData: this.formData,
			})
		  })
		  .catch(reject)
	}
  })

  // 生成formData
  generateForm(file) {
	return new Promise(resolve => {
	  this.getFormData(file)
		  .then(form => {
			form.append(this.$options.fileName, file)
			resolve(form)
		  })
	})
  }

  getFormData(file) {
	return new Promise(resolve => {
	  let form = new FormData()
	  let {getFormData, getFormDataAsync} = this.$options
	  if (typeof getFormData === 'function') {
		let formData = getFormData(file)
		if (typeof formData === 'object') {
		  this.formData = formData
		  Object.keys(formData).forEach(key => {
			form.append(key, formData[key])
		  })
		}
		resolve(form)
		return
	  }
	  if (typeof getFormDataAsync === 'function') {
		getFormDataAsync((formData) => {
		  if (typeof formData === 'object') {
			this.formData = formData
			Object.keys(formData).forEach(key => {
			  form.append(key, formData[key])
			})
		  }
		  resolve(form)
		}, file)
		return
	  }
	  resolve(form)
	})
  }

}
