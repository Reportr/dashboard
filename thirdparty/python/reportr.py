# Python imports
import os
import json
import sys
import base64
import json

if sys.version_info < (3, 0):  # pragma: no cover
    from urllib import quote, urlencode
    from urlparse import parse_qsl, urlsplit, urlunsplit, urljoin, urlparse

    def is_basestring(astring):
        return isinstance(astring, basestring)  # NOQA

    def iteritems(adict):
        return adict.iteritems()

else:  # pragma: no cover
    from urllib.parse import (quote, urlencode, parse_qsl, urlsplit,
                              urlunsplit, urljoin, urlparse)

    # placate pyflakes
    (quote, urlencode, parse_qsl, urlsplit, urlunsplit, urljoin)

    def is_basestring(astring):
        return isinstance(astring, (str, bytes))

    def iteritems(adict):
        return adict.items()

# Libs imports
import requests
from requests.sessions import Session

def absolute_url(url):
    return url.startswith(('http://', 'https://'))

class Reportr(Session):
    __attrs__ = Session.__attrs__ + ['host', 'token']
    
    def __init__(self, host="http://localhost:5000", token=None):
        super(Reportr, self).__init__()
        self.headers.update({'Content-Type': 'application/json'})
        self.host = host
        self.token = token
        

    def _set_url(self, url):
        if not absolute_url(url):
            return urljoin(self.host, url)
        return url

    def request(self, method, url, bearer_auth=True, **req_kwargs):
        '''
        A loose wrapper around Requests' :class:`~requests.sessions.Session`

        :param method: A string representation of the HTTP method to be used.
        :type method: str
        :param url: The resource to be requested.
        :type url: str
        :param bearer_auth: Whether to use Bearer Authentication or not,
            defaults to `True`.
        :type bearer_auth: bool
        :param \*\*req_kwargs: Keyworded args to be passed down to Requests.
        :type \*\*req_kwargs: dict
        '''
        url = self._set_url(url)

        return super(Reportr, self).request(method, url, **req_kwargs)

    def track(self, namespace, event, **kwargs):
        """
        Track an event

        :param event: name of the event
        :param namespace: namespace for the event
        :param properties: properties for the event
        """
        kwargs["event"] = event
        kwargs["namespace"] = namespace
        r = self.request("get", "api/"+self.token+"/events/track", params={
            "data": base64.b64encode(json.dumps(kwargs))
        })
        r.raise_for_status()
        return r

    def model(self, namespace, event, **kwargs):
        """
        Define a model for an event type

        :param event: name of the event
        :param namespace: namespace for the event
        """
        kwargs["event"] = event
        kwargs["namespace"] = namespace
        r = self.request("get", "api/"+self.token+"/model/set", params={
            "data": base64.b64encode(json.dumps(kwargs))
        })
        r.raise_for_status()
        return r

