<template>
    <div class="container">

        <label class="label is-large">인증 코드를 입력해 주세요</label>

        <div class="field">
            <p class="control">
                <input v-model="passCode" class="input" type="password" placeholder="인증코드">
            </p>
        </div>

        <div class="field">
            <p class="control">
                <button @click="authorize" class="button is-success">
                    인증하기
                </button>
            </p>
        </div>

    </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import { db } from '@/firebase'

  export default {
    name: 'landing-page',
    components: {SystemInformation},
    data: function () {
      return {
        passCode: ''
      }
    },
    firebase: {
      dbAuthCodes: db.ref('authCodes')
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      authorize () {
        const authRef = this.$firebaseRefs.dbAuthCodes.orderByChild('code').equalTo(this.passCode)
        authRef.on('value', snapShot => {
          if (snapShot.val() !== null) return this.$router.replace('main')
          alert('인증 실패')
        })
      }
    }
  }
</script>

<style scoped>
    .container {
        padding-top: 25%;
        text-align: center;
    }

    .button {
        width: 84%;
    }

    .control {
        text-align: center;
    }

    input.input {
        width: 84%;
    }
</style>
