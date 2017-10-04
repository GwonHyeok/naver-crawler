/**
 * Created by ghyeok on 2017. 10. 04..
 */
import Firebase from 'firebase'

const firebaseApp = Firebase.initializeApp({
  apiKey: 'AIzaSyD-VmIuK-ze5sUnC_NoaR3DKA0YfLs_tlk',
  authDomain: 'naver-crawler-8eb27.firebaseapp.com',
  databaseURL: 'https://naver-crawler-8eb27.firebaseio.com',
  projectId: 'naver-crawler-8eb27',
  storageBucket: 'naver-crawler-8eb27.appspot.com',
  messagingSenderId: '136955119182'
})

export default firebaseApp
export const db = firebaseApp.database()
export const auth = firebaseApp.auth()
