<template>
    <section class="hero is-fullheight is-fullwidth">

        <div class="container">

            <!-- 상단 검색 필드 -->
            <div class="field has-addons has-addons-centered">
                <p class="control">
                    <span class="select">
                        <select>
                            <option>지도기반</option>
                            <option>스토어팜</option>
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
            <progress class="progress is-medium is-primary" v-bind:value="progress" max="100">{{progress}}%</progress>

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

                <table class="table">
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
        progress: 0
      }
    },
    methods: {
      search () {
        this.isLoading = true
        this.progress = 0
        const crawler = this.$crawler.getBusinessCrawler(this.keyword)
        crawler.on('success', () => {
          setTimeout(() => {
            // 로컬 아이템 업데이트
            this.items = crawler.items
            this.isLoading = false
          }, 500)
        })
        crawler.on('progress', ({progress}) => {
          this.progress = progress
        })
        crawler.on('error', error => {
          console.error(error)
          this.isLoading = false
        })
        crawler.run()
      },
      save () {
        console.log('save to csv')
        this.$crawler.saveToCsv(this.items)
          .then(result => console.log(result))
          .catch(error => console.error(error))
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
