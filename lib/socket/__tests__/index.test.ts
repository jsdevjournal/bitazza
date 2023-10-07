import BTZSocket, { SocketListener, SocketRequest, SocketResponse } from '../index';

describe('BTZSocket Class', () => {
  let btzsocket: BTZSocket;

  const websocket = {
    send: jest.fn(),
    close: jest.fn(),
    onopen: null as any,
    onmessage: null as any,
    onerror: null as any,
    onclose: null as any,
  };

  beforeEach(() => {
    global.WebSocket = jest.fn().mockImplementation(() => websocket);
    btzsocket = new BTZSocket({ url: 'test-url' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should create an instance of BTZSocket', () => {
    expect(btzsocket).toBeInstanceOf(BTZSocket);
  });

  it('should handle onOpen event', () => {
    const mockListener: SocketListener = {
      onOpen: jest.fn(),
    };
    btzsocket.addListener(mockListener);
    websocket.onopen();

    expect(mockListener.onOpen).toHaveBeenCalled();
  });

  it('should not send data to the socket if socket if not open', () => {
    const payload: SocketRequest['AuthenticateUser'] = {
      Username: 'testUser',
      Password: 'testPassword',
    };

    btzsocket.send('AuthenticateUser', payload);

    expect(websocket.send).not.toHaveBeenCalled()

    websocket.onopen()

    expect(websocket.send).toHaveBeenCalledWith(
      expect.stringContaining('AuthenticateUser'),
    )
  })

  it('should not send data to the socket', () => {
    const payload: SocketRequest['AuthenticateUser'] = {
      Username: 'testUser',
      Password: 'testPassword',
    };

    websocket.onopen()
    btzsocket.send('AuthenticateUser', payload);

    expect(websocket.send).toHaveBeenCalledWith(
      expect.stringContaining('AuthenticateUser'),
    )
  })

  it('should handle onMessage event', () => {
    const mockListener: SocketListener = {
      onMessage: jest.fn(),
    };
    btzsocket.addListener(mockListener);
    const mockResponse: SocketResponse['AuthenticateUser'] = {
      Authenticated: true,
      User: {
        UserId: 1,
        UserName: 'testUser',
        Email: 'test@example.com',
        EmailVerified: true,
        AccountId: 123,
        OmsId: 456,
        Use2FA: false,
      },
    };

    websocket.onopen()
    websocket.onmessage({
      data: JSON.stringify({
        i: 0,
        m: 1,
        n: 'AuthenticateUser',
        o: JSON.stringify(mockResponse)
      })
    });

    expect(mockListener.onMessage).toHaveBeenCalled()

  });

  it('should not handle onMessage event', () => {
    const mockListener: SocketListener = {
      onMessage: jest.fn(),
    };
    btzsocket.addListener(mockListener);
    const mockResponse: SocketResponse['AuthenticateUser'] = {
      Authenticated: true,
      User: {
      },
    };

    websocket.onopen()
    websocket.onmessage({
      data: JSON.stringify({
        i: 0,
        m: 0,
        n: 'AuthenticateUser',
        o: JSON.stringify(mockResponse)
      })
    });

    expect(mockListener.onMessage).not.toHaveBeenCalled()

  });

  it('should handle promise send event', async () => {
    const payload: SocketRequest['AuthenticateUser'] = {
      Username: 'testUser',
      Password: 'testPassword',
    };
    const mockResponse: SocketResponse['AuthenticateUser'] = {
      Authenticated: true,
      User: {
      },
    };

    websocket.onopen()
    setTimeout(() => {
      websocket.onmessage({
        data: JSON.stringify({
          i: 2,
          m: 1,
          n: 'AuthenticateUser',
          o: JSON.stringify(mockResponse)
        })
      });
    }, 50)
    await btzsocket.sendPromise('AuthenticateUser', payload)

    expect(websocket.send).toHaveBeenCalledWith(
      expect.stringContaining('AuthenticateUser'),
    )

  });
  // Add more test cases for other methods and scenarios as needed
});
