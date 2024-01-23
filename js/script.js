// memanggil event contentLoaded untuk memangaktifkan event submit pada form
document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    // berfungsi untuk mencegah terjadinya event bawaan dari sebuah DOM
    // misal saat click reload -> preventDefault tidak ikut reload karna menghapus event bawaan DOM
    event.preventDefault();
    addTodo();
  });
  if(isStorageExist()) {
    loadDataFromStorage()
  }
});

// function yang menampung element todo (id, task, timeStamp, isCompleted)
function addTodo() {
  const textTodo = document.getElementById('title').value; // mengambil isi dari judul
  const timeStamp = document.getElementById('date').value; // mengambil isi dari date

  const generatedID = generateId(); // menyimpan function yang menggenerate id
  const todoObject = generateTodoObject(generatedID, textTodo, timeStamp, false); // menyimpan function daripada element-element todo
  todos.push(todoObject); // menyimpan todo yang sudah dibuat oleh user ke array todos

  // memicu/mentrigger event pada document untuk di simpan pada event baru yaitu RENDER_EVENT, yang selanjutnya akan digunakan
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData()
}

// function yang men-generate id dengan mengembalikan id unik dari date berupa integer/angka
function generateId() {
  return +new Date();
}

// mengembalikan dalam bentuk object dari variable todoObject diatas
function generateTodoObject(id, task, timeStamp, isCompleted) {
  return {
    id,
    task,
    timeStamp,
    isCompleted
  }
}

const todos = []; // wadah daripada todo-todo yang ditambahkan oleh user untuk disimpan dalam array todos
const RENDER_EVENT = 'render-todo';

// gantian sekarang document yg diberi event custom yaitu RENDER_EVENT yg tadi sudah dibuat
document.addEventListener(RENDER_EVENT, function () {
  const unclompetedTODOList = document.getElementById('todos')
  unclompetedTODOList.innerHTML = '' // bermaksud agar isi container kosong, mencegah duplikasi data yang sama

  const completedTODOList = document.getElementById('completed-todos')
  completedTODOList.innerHTML = ''

  // melakukan perulangan dari item todos -> selanjutnya todoItem disimpan dalam function makeTodo untuk dijadikan anak dari element id todos
  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem)
    if(!todoItem.isCompleted) 
      unclompetedTODOList.append(todoElement)
    else
      completedTODOList.append(todoElement)
  }
})

// ini function untuk membuat beberapa element html dan diisi oleh variable todoItem tadi yg sudah di looping
function makeTodo(todoObject) {
  const textTitle = document.createElement('h2') // element penampung input judul
  textTitle.innerText = todoObject.task 

  const textStamp = document.createElement('p') // element penampung input tanggal
  textStamp.innerText = todoObject.timeStamp

  const textContainer = document.createElement('div') // element penampung judul dan tanggal
  textContainer.classList.add('inner')
  textContainer.append(textTitle, textStamp)

  const container = document.createElement('div') // element penampung textContainer
  container.classList.add('item', 'shadow')
  container.append(textContainer)
  container.setAttribute('id', `todo-${todoObject.id}`) // element container-lah yang menampung isi task yang di input user, selanjutnya diberi id todo-id

  // pembuatan button dengan boolean
  if (todoObject.isCompleted) { // disini isCompleted = false
    const undoButton = document.createElement('button') // membuat button undo
    undoButton.classList.add('undo-button')
    
    undoButton.addEventListener('click', function() {
      undoTaskFromCompleted(todoObject.id) // menjalnkan fungsi undo ketika di click
    })
    
    const trashButton = document.createElement('button') // membuat button trash
    trashButton.classList.add('trash-button')
    
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(todoObject.id) // menjalankan fungsi trash ketika di click
    })
    
    container.append(undoButton, trashButton) // kedua element di atas disimpan dalam div.container agar sebaris
    
  } else { // jika nilai isCompleted = true
    const checkButton = document.createElement('button') // membuat button check yang artinya user mencentang bahwa task sudah selesai
    checkButton.classList.add('check-button')
    
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(todoObject.id) // menjalankan fungsi check ketika di click
    })
    
    container.append(checkButton) // juga di simpan di div.container agar sebaris
  }
  
  return container // mengembalikan variable container
}
  // ini adalah fungsi yang telah dideklrasikan dalam variable checkButton diatas, untuk bisa dijalankan
function addTaskToCompleted(todoId) { // parameternya sebenarnya sama dengan todoObject.id
  const todoTarget = findTodo(todoId) // membuat variable untuk menjalankan fungsi findId -> yang mana ditugaskan untuk mencari id yang sesuai

  if (todoTarget == null) return // jika todoId tidak ditemukan, kembalikan null

  todoTarget.isCompleted = true // jika varible penampung findId tadi id nya bernilai true -> di render
  document.dispatchEvent(new Event(RENDER_EVENT)) // berfungsi untuk memperbarui data
  saveData()
}
  
// fungsi untuk menemukan todoId agar hasilnya tidak undefined
function findTodo(todoId) {
  for (const todoItem of todos) {
    if(todoItem.id === todoId) {
      return todoItem
    }
  }
  return null
}

// function daripada button trash
function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId) // wadah untuk fungsi pencarian index todoId
    
  if (todoTarget === -1) return // gak paham 

// fungsi splice bawaan js yang bekerja pada array, berfungsi untuk menghapus dan menambahkan array -> lihat di Tutorial JavaScript di safari 
  todos.splice(todoTarget, 1) // tetep aja gak paham
  document.dispatchEvent(new Event (RENDER_EVENT))
  saveData()
}

// fungsi menemukan index array untuk dihapus
function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) { // jika index dari array todos.id(nya) sama dengan paramater id nya maka...
    return index // kembalikan index
    }
  }
  return -1
}

// fungsi undo
function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId) // fungsi findTodo di inisialisasi ke variable todoTarget

  if(todoTarget == null) return // kembalikan null

  todoTarget.isCompleted = false // dan kembalikan ke taskTodo
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

// fungsi simpan data
function saveData() {
  if(isStorageExist()) { // jika fungsi disamping bernilai true jalankan fungsi dibawah
    const parsed = JSON.stringify(todos) // variable ngerubah JSON ke string untuk variable todos
    localStorage.setItem(STORAGE_KEY, parsed) // buat key dan nilainya
    document.dispatchEvent(new Event(SAVED_EVENT)) // render
  }
}

const SAVED_EVENT = 'saved-todo' // gak mudeng
const STORAGE_KEY = 'TODO_APPS' // ngerubah aja

// fungsi cek web browser
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser tidak mendukung Web Storage!')
    return false
  } 
  return true
}

// cek di console
document.addEventListener(SAVED_EVENT, function() {
  console.log(localStorage.getItem(STORAGE_KEY))
})

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY)
  let data = JSON.parse(serializedData)

  if(data !== null) {
    for(const todo of data) {
      todos.push(todo)
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT))
}