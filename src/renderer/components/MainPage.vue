<template>
    <section class="hero is-fullheight is-fullwidth">

        <div class="container">

            <!-- 상단 검색 필드 -->
            <div class="field has-addons has-addons-centered">
                <p class="control">
                    <span class="select">
                        <select v-model="selectedType">
                            <option v-for="item in crawlerTypes" :value="item.value">{{item.name}}</option>
                        </select>
                    </span>
                </p>
                <p class="control" v-if="isSupportStoreFarmCategory && selectedType === 'storefarm'">
                    <span class="select">
                        <select v-model="selectedStoreFarmCategory">
                            <option v-for="item in storeFarmCategories" :value="item.value">{{item.name}}</option>
                        </select>
                    </span>
                </p>
                <p class="control is-expanded">
                    <input class="input" type="text" placeholder="키워드를 입력해주세요" v-model="keyword">
                </p>
                <p class="control">
                    <a class="button is-primary" v-bind:class="{'is-loading': this.isLoading}" @click="search">
                        검색
                    </a>
                </p>

            </div>

            <!-- Progress -->
            <progress class="progress is-medium" :class="{'is-primary': !this.isError, 'is-danger': this.isError}"
                      v-bind:value="progress" max="100">{{progress}}%
            </progress>

            <!-- 검색결과 -->
            <div class="search-result">
                <div class="columns">
                    <div class="column is-one-quarter">
                        <p class="title is-4 is-pulled-left">검색결과</p>
                    </div>
                    <div class="column">
                        <div class="is-pulled-right">
                            <a class="button" @click="save">
                                <span>액셀로 저장하기</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- 비지니스 타입 테이블-->
                <table class="table" v-if="this.selectedType ==='business'">
                    <thead>
                    <tr>
                        <th><abbr title="Index">아이디</abbr></th>
                        <th>이름</th>
                        <th><abbr title="Phone">연락처</abbr></th>
                        <th><abbr title="Address">주소</abbr></th>
                        <th><abbr title="Category">카테고리</abbr></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in items">
                        <th>{{item.id}}</th>
                        <td>{{item.name}}</td>
                        <td>{{item.phone}}</td>
                        <td>{{item.roadAddr}}</td>
                        <td>{{item.category}}</td>
                    </tr>
                    </tbody>


                </table>

                <!-- 스토어팜 타입 테이블 -->
                <table class="table" v-if="this.selectedType ==='storefarm'">
                    <thead>
                    <tr>
                        <th>이름</th>
                        <th>타입</th>
                        <th>상호명</th>
                        <th>대표</th>
                        <th>연락처</th>
                        <th>주소</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in items">
                        <th><a target="_blank" :href="item.siteUri">{{item.storeName}}</a></th>
                        <td>{{item.storeType}}</td>
                        <td>{{item.tradeName}}</td>
                        <td>{{item.ceo}}</td>
                        <td>{{item.contact}}</td>
                        <td>{{item.address}}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'main-page',
    components: {SystemInformation},
    data: function () {
      return {
        keyword: '',
        items: [],
        isLoading: false,
        isError: false,
        progress: 0,
        crawlerTypes: [
          {name: '지도기반', value: 'business'},
          {name: '스토어팜', value: 'storefarm'}
        ],
        selectedType: 'business',
        isSupportStoreFarmCategory: true,
        selectedStoreFarmCategory: '0_0',
        storeFarmCategories: [
          {name: '전체보기', value: '0_0'},
          {name: '종합카테고리', value: 'C36000'},
          {name: '패션의류', value: '50000000'},
          {name: '패션잡화', value: '50000001'},
          {name: '화장품⁄미용', value: '50000002'},
          {name: '디지털⁄가전', value: '50000003'},
          {name: '가구⁄인테리어', value: '50000004'},
          {name: '출산⁄육아', value: '50000005'},
          {name: '식품', value: '50000006'},
          {name: '스포츠⁄레저', value: '50000007'},
          {name: '생활⁄건강', value: '50000008'},
          {name: '여행⁄문화', value: '50000009'},
          {name: '면세점', value: '50000010'}
        ]
      }
    },
    mounted: function () {
      this.$electron.ipcRenderer.on('started-crawler', () => {
        console.log('started-crawler')
        this.isLoading = true
        this.progress = 0
        this.isError = false
      })

      this.$electron.ipcRenderer.on('progress-crawler', (event, {progress}) => {
        console.log('progress-crawler')
        this.progress = progress
      })

      this.$electron.ipcRenderer.on('success-crawler', (event, {items}) => {
        console.log('success-crawler')
        this.items = items
      })

      this.$electron.ipcRenderer.on('error-crawler', (event, error) => {
        console.log('error-crawler')
        this.isError = true
        console.error(error)
      })

      this.$electron.ipcRenderer.on('complete-crawler', () => {
        console.log('complete-crawler')
        this.isLoading = false
      })
    },
    methods: {
      search () {
        this.startCrawler()
      },
      startCrawler () {
        this.$electron.ipcRenderer.send('start-crawler', {
          type: this.selectedType,
          keyword: this.keyword,
          category: this.selectedStoreFarmCategory
        })
      },
      save () {
        this.$electron.ipcRenderer.send('save-to-csv', {
          items: this.items,
          keyword: this.keyword,
          type: this.selectedType
        })
      }
    }
  }
</script>

<style scoped>

    .button {
        min-width: 100px;
    }

    section {
        min-width: 100vw;
    }

    .container {
        padding: 16px;
        min-width: 100%;
    }

    .search-result {
        padding-left: 16px;
        padding-right: 16px;
        margin-top: 32px;
    }

    progress {
        transition: all 0.5s ease;
    }

    .progress::-webkit-progress-value {
        transition: width 0.5s ease;
    }

</style>
