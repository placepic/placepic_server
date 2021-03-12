module.exports = {
    NULL_VALUE: '필요한 값이 없습니다',
    OUT_OF_VALUE: '파라미터 값이 잘못되었습니다',

    //토큰
    EMPTY_TOKEN: '헤더에 토큰이 없습니다.',
    EXPIRED_TOKEN: '토큰이 만료됨.',
    INVALID_TOKEN: '유효하지 않은 토큰',

    // 회원가입
    CREATED_USER: '회원 가입 성공',
    DELETE_USER: '회원 탈퇴 성공',
    ALREADY_ID: '이미 사용중인 아이디입니다.',
    POSSIBLE_ID: '회원 가입이 가능한 아이디입니다.',

    // MESSAGE
    SEND_MESSAGE_SUCCESS: '메시지 발송 성공',

    // 로그인
    LOGIN_SUCCESS: '로그인 성공',
    LOGIN_FAIL: '로그인 실패',
    NO_USER: '존재하지 않는 회원입니다.',
    MISS_MATCH_PW: '비밀번호가 맞지 않습니다.',
    MISS_MATCH_CN: '인증번호가 맞지 않습니다.',

    // 프로필 조회
    READ_PROFILE_SUCCESS: '프로필 조회 성공',

    // place
    SEARCH_PLACE_SUCCESS: '장소 조회 성공',
    NO_PLACE: '장소 없음',
    POST_PLACE: '장소 글쓰기 완료',
    NO_MATCHED_PLACE_USER: '유저 정보 게시글 일치하지 않음',
    ADD_LIKE: '좋아요 성공',
    ALREADY_LIKE: '이미 등록된 좋아요',
    NO_LIKE: '좋아요가 없습니다.',
    DELETE_LIKE: '좋아요 삭제 성공',
    GET_LIKE_LIST: '좋아요 리스트 불러오기 성공',
    ADD_BOOKMARK: '북마크 성공',
    ALREADY_BOOKMARK: '이미 등록된 북마크',
    NO_BOOKMARK: '북마크가 없습니다.',
    DELETE_BOOKMARK: '북마크 삭제 성공',
    READ_PLACES: '플레이스 조회 성공',
    DELETE_PLACE: '장소 삭제',
    NO_ACCESS_PLACE: '장소 접근 불가',
    NOT_DELETE_PLACE: '장소 삭제 불가',

    // api
    SEARCH_NAVER_MAP: '네이버 맵 장소 조회 성공',

    //DB에러
    DB_ERROR: 'DB에러',
    //그룹 신청
    apply_SUCCESS: '그룹 신청 성공',
    apply_ERROR: '그룹 신청 실패',

    //그룹 리스트 불러오기
    CALL_GROUP_LIST: '그룹 리스트 불러오기 성공',
    CALL_GROUP_FAIL: '해당 그룹이 존재하지 않습니다.',

    // 신청대기 갯수 불러오기
    CALL_APPLYCOUNT_SUCCESS: '대기목록 갯수 불러오기 성공',
    CALL_APPLYCOUNT_FAIL: '대기목록 갯수 불러오기 실패',

    //서버에러
    INTERNAL_SERVER_ERROR: '서버 내부 에러',

    //CATEGORY
    READ_CATEGORY: '카테 고리 불러오기 성공',
    NO_READ_CATEGORY: '카테고리 불러오기 실패',
    READ_ALL_CATEGORY_TAGS: '모든 카테고리별 태그들 불러오기 성공',
    NO_READ_ALL_CATEGORY_TAGS: '모든 카테고리별 태그들 불러오기 실패',

    //TAG
    READ_TAG: '태그 읽어오기 성공',
    NO_MATCHED_CATEGORY_TAG: '입력한 기본 정보 태그와 카테고리 태그 정보와 맞지 않음',
    NO_MATCHED_CATEGORY_INFO_TAG: '입력한 유용한 정보 태그와 카테고리 태그 정보와 맞지 않음',
    READ_ALL_TAG: '모든 태그 읽기 성공',
    NO_READE_TAG: '태그 읽기 실패',

    //SUBWAY
    READ_SUBWAY: '지하철 조회 성공',
    NO_READ_SUBWAY: '지히철 일치 실패.',

    //GROUP
    INVALID_GROUP_USER: '일치하지 않는 유저 그룹.',
    ALREADY_GROUP_USER: '이미 가입된 그룹',
    CALL_APPLY_GROUP: '지원 가능한 그룹조회 불러오기 성공',
    NO_GROUP: '존재하지 않는 그룹',

    //ADMIN
    CALL_MYWAITUSERLIST_SUCCESS: '내 그룹 대기유저 불러오기 성공',
    CALL_MYWAITUSERLIST_FAIL: '내 그룹 대기유저 불러오기 실패',
    EDIT_MYWAITUSERSTATE_SUCCESS: '내 그룹 대기유저 승인 성공',
    EDIT_MYWAITUSERSTATE_FAIL: '내 그룹 대기유저 승인 실패',
    DELETE_MYWAITUSER_SUCCESS: '내 그룹 대기유저 거절 성공',
    DELETE_MYWAITUSER_FAIL: '내 그룹 대기유저 거절 실패',

    //RANKING USER SUCCESS
    CALL_MYGROUPRANKING_SUCCESS: '내 그룹 랭킹 불러오기 성공',

    //MY INFO
    NOT_IN_GROUP_USER: '그룹에 유저가 속해있지 않습니다.',
    EDIT_MYINFO: '프로필사진, 소속 변경 완료',

    //Your INFO
    CALL_YOUR_INFO: '다른유저의 프로필을 불러오는데 성공',

    //BANNER
    GET_BANNER_SUCCESS: '배너 리스트 조회 성공.',
    GET_BANNER_FAIL: '배너 가져오기 실패',
    NOT_ACCESS_BANNER: '배너 접근 권한 없음. 그룹 불일치!',

    //COMMENT
    CREATE_COMMENT_SUCCESS: '댓글 생성 완료.',
    CREATE_COMMENT_FAIL: '댓글 생성 실패.',
    GET_COMMENTS_SUCCESS: '댓글 가져오기 성공',
    GET_COMMENTS_FAIL: '댓글 가져오기 실패',
    DELETE_COMMENTS_SUCCESS : '댓글 삭제 성공',
    DELETE_COMMENTS_FAIL : '댓글 삭제 실패'
};
