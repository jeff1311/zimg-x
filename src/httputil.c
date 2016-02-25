#include "httputil.h"
#include <netdb.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include "zlog.h"
//LOG_TAG

int sendhttp();

#define BUFFSIZE 0xF000

int httpGet(char* hostname)

{
	LOG_PRINT(LOG_DEBUG, "hostname = %s",hostname);

	char request[BUFFSIZE], text[BUFFSIZE];

	char myurl[BUFFSIZE] = { 0 };

	char host[BUFFSIZE] = { 0 };

	char GET[BUFFSIZE] = { 0 };

	struct sockaddr_in sin;

	int sockfd;

	if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) == -1) {

		LOGE("httpget create socket failed !");

		return -100;

	}

	struct hostent * host_addr = gethostbyname(hostname);

	if (host_addr == NULL) {

		LOG_PRINT(LOG_DEBUG, "httpget Unable to locate host");

		return -103;

	}

	sin.sin_family = AF_INET;

	sin.sin_port = htons((unsigned short) 4680);

	sin.sin_addr.s_addr = *((unsigned long*) host_addr->h_addr_list[0]);

	if (connect(sockfd, (const struct sockaddr *) &sin,
			sizeof(struct sockaddr_in)) == -1) {

		LOG_PRINT(LOG_DEBUG, "httpget connect failed !");

		return -101;

	}

	LOG_PRINT(LOG_DEBUG, "httpGet send");

// 向WEB服务器发送URL信息

	memset(request, 0, BUFFSIZE);

	strcat(request, "GET /index.html HTTP/1.1\r\n"); //请求内容与http版本

	strcat(request, "HOST:"); //主机名，，格式："HOST:主机"

	strcat(request, hostname);

	strcat(request, "\r\n");

	strcat(request, "Accept:*/*\r\n"); //接受类型，所有类型

// strcat(request, "User-Agent:Mozilla/4.0 (compatible; MSIE 5.00; Windows 98)");//指定浏览器类型？

// strcat(request, "Connection: Keep-Alive\r\n");//设置连接，保持连接

// strcat(request, "Set Cookie:0\r\n");//设置Cookie

// strcat(request, "Range: bytes=0 - 500\r\n");//设置请求字符串起止位置，断点续传关键"Range: bytes=999 -"

	strcat(request, "\r\n"); //空行表示结束

	LOG_PRINT(LOG_DEBUG, request);

	if (send(sockfd, request, strlen(request), 0) == -1) {

		LOG_PRINT(LOG_DEBUG, "httpget send failed");

		return -99;

	}

	LOG_PRINT(LOG_DEBUG, "httpGet recv");

	memset(text, 0, BUFFSIZE);

	if (recv(sockfd, text, BUFFSIZE, 0) == -1) {

		LOG_PRINT(LOG_DEBUG, "httpget recv failed");

		return -98;

	}

	LOG_PRINT(LOG_DEBUG, text);

	LOG_PRINT(LOG_DEBUG, "httpGet end");

	return 0;

}

